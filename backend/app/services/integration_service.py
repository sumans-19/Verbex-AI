from prisma import Prisma
from .github_service import create_github_issue, check_duplicate_issue, get_github_issue_status, trigger_github_action
from .jira_service import create_jira_ticket, get_jira_ticket_status
from datetime import datetime
from ..config import settings

async def push_task_to_integrations(
    task_id: str,
    db: Prisma,
    push_github: bool = True,
    push_jira: bool = True,
) -> dict:
    # Fetch task with meeting and employee
    task = await db.task.find_unique(
        where={"id": task_id},
        include={"meeting": True, "employee": True}
    )
    
    if not task:
        return {"success": False, "error": "Task not found"}

    results = {
        "task_id": str(task.id),
        "task_title": task.title,
        "assignee_name": task.assignee_name,
        "github": None,
        "jira": None,
    }

    meeting_title = task.meeting.title if task.meeting else ""
    priority_str = task.priority
    
    # --- FETCH DYNAMIC CREDENTIALS ---
    emp_id = task.employee.emp_id if task.employee else "EMP001"
    creds = settings.get_employee_credentials(emp_id)

    # --- FALLBACK LOGIC ---
    # If no employee is currently linked to the task, try to find the "Master Employee"
    target_employee = task.employee
    if not target_employee:
        # Use raw selection to bypass potentially outdated client models
        employees = await db.query_raw(
            "SELECT * FROM employees WHERE github_username IS NOT NULL OR jira_account_id IS NOT NULL LIMIT 1"
        )
        if employees:
            # Prisma query_raw returns a list of dicts
            emp_data = employees[0]
            # Link the task to this employee for future reference
            await db.task.update(
                where={"id": task_id},
                data={"employee_id": emp_data["id"]}
            )
            github_user = emp_data.get("github_username")
            jira_id = emp_data.get("jira_account_id")
        else:
            github_user = None
            jira_id = None
    else:
        github_user = target_employee.github_username
        jira_id = target_employee.jira_account_id

    if push_github:
        duplicate = await check_duplicate_issue(task.title)
        if duplicate:
            results["github"] = {
                "success": False,
                "duplicate": True,
                "existing_url": duplicate["issue_url"],
                "message": f"Issue already exists: #{duplicate['issue_number']}",
            }
        else:
            github_result = await create_github_issue(
                task_title=task.title,
                task_description=task.description or "",
                source_quote=task.source_quote or "",
                meeting_title=meeting_title,
                priority=priority_str,
                github_username=github_user,
                assignee_name=task.assignee_name,
                repo_owner=creds["gh_owner"],
                repo_name=creds["gh_repo"],
                token=creds["gh_token"],
            )
            if github_result["success"]:
                # Also trigger a GitHub Action (e.g. to notify or start a CI job)
                await trigger_github_action(
                    repo_owner=creds["gh_owner"],
                    repo_name=creds["gh_repo"],
                    token=creds["gh_token"]
                )
            if github_result["success"]:
                # Use execute_raw for new columns to avoid Prisma Client model mismatches
                await db.execute_raw(
                    "UPDATE tasks SET github_issue_url = $1, status = 'approved' WHERE id = $2",
                    github_result["issue_url"], task_id
                )
            results["github"] = github_result

    if push_jira:
        jira_result = await create_jira_ticket(
            task_title=task.title,
            task_description=task.description or "",
            source_quote=task.source_quote or "",
            meeting_title=meeting_title,
            priority=priority_str,
            jira_account_id=jira_id,
            assignee_name=task.assignee_name,
            jira_domain=creds["jira_domain"],
            jira_email=creds["jira_email"],
            jira_token=creds["jira_token"],
            jira_project_key=creds["jira_project"],
        )
        if jira_result["success"]:
            # Use execute_raw for new columns
            await db.execute_raw(
                "UPDATE tasks SET jira_issue_key = $1, status = 'approved' WHERE id = $2",
                jira_result["issue_key"], task_id
            )
        results["jira"] = jira_result

    return results

async def sync_all_task_statuses(meeting_id: str, db: Prisma):
    """Fetch real-time status from GitHub/Jira and update local Task records"""
    # Use query_raw to fetch columns that might not be in the client model
    tasks = await db.query_raw(
        "SELECT * FROM tasks WHERE meeting_id = $1 AND (github_issue_url IS NOT NULL OR jira_issue_key IS NOT NULL)",
        meeting_id
    )

    sync_results = []
    for task_data in tasks:
        task_id = task_data["id"]
        github_issue_url = task_data.get("github_issue_url")
        jira_issue_key = task_data.get("jira_issue_key")
        emp_id = task_data.get("owner_emp_id") or "EMP001" # Or join with employee table
        
        # Fetch credentials for this specific employee
        creds = settings.get_employee_credentials(emp_id)
        
        updates = {}
        
        # 1. Sync GitHub Status
        if github_issue_url:
            try:
                issue_num = int(github_issue_url.split("/")[-1])
                github_state = await get_github_issue_status(
                    issue_number=issue_num,
                    repo_owner=creds["gh_owner"],
                    repo_name=creds["gh_repo"],
                    token=creds["gh_token"]
                )
                if github_state == "closed":
                    updates["status"] = "discarded"
            except:
                pass

        # 2. Sync Jira Status
        if jira_issue_key:
            jira_status = await get_jira_ticket_status(
                issue_key=jira_issue_key,
                jira_domain=creds["jira_domain"],
                jira_email=creds["jira_email"],
                jira_token=creds["jira_token"]
            )
            if jira_status in ["Done", "Resolved", "Closed", "Complete"]:
                updates["status"] = "discarded"

        if updates:
            # Use execute_raw for status update to be safe
            await db.execute_raw(
                "UPDATE tasks SET status = $1 WHERE id = $2",
                updates["status"], task_id
            )
            sync_results.append({"task_id": task_id, "updates": updates})

    return sync_results

async def push_all_approved_tasks(meeting_id: str, db: Prisma) -> list:
    tasks = await db.task.find_many(
        where={
            "meeting_id": meeting_id,
            "status": "approved",
        }
    )

    results = []
    for task in tasks:
        result = await push_task_to_integrations(
            task_id=task.id,
            db=db,
            push_github=True,
            push_jira=True,
        )
        results.append(result)

    return results
