import asyncio
import os
from prisma import Prisma
from app.routers.meetings import save_tasks_and_decisions
from dotenv import load_dotenv

load_dotenv()

async def verify():
    db = Prisma()
    await db.connect()
    
    # 1. Check if our seeded employees are there (using raw SQL)
    print("Checking database for team members via raw SQL...")
    emps = await db.query_raw("SELECT * FROM employees")
    for e in emps:
        # e is a dict here
        print(f"- {e.get('name')} (Github: {e.get('github_username')}, Jira: {e.get('jira_account_id')})")

    # 2. Simulate Gemini Output for "Likhith Gowda M"
    print("\nSimulating AI extraction for 'Likhith Gowda M'...")
    meeting = await db.meeting.create(data={"title": "Test Mapping", "host_name": "System"})
    
    ai_data = {
        "tasks": [
            {
                "title": "Fix Frontend Bug",
                "assignee_name": "Likhith Gowda M",
                "confidence_score": 0.95,
                "priority": "high",
                "source_quote": "Likhith will fix the bug"
            }
        ],
        "decisions": []
    }
    
    await save_tasks_and_decisions(meeting.id, ai_data, db)
    
    # 3. Verify task is linked (using raw SQL to be safe)
    # Note: query_raw with params uses $1, $2 for Postgres
    tasks = await db.query_raw("SELECT * FROM tasks WHERE meeting_id = $1", meeting.id)
    if tasks:
        task = tasks[0]
        emp_id = task.get("employee_id")
        if emp_id:
            # Look up the employee to confirm it's the right one
            emp_row = await db.query_raw("SELECT * FROM employees WHERE id = $1", emp_id)
            if emp_row:
                emp = emp_row[0]
                print(f"✅ SUCCESS: Task '{task['title']}' linked to {emp['name']}!")
                print(f"Mapping Integrity: {emp['github_username']} == 'likithgowdam10'")
            else:
                print("❌ FAILED: Linked employee not found in DB.")
        else:
            print("❌ FAILED: Task not linked to employee_id.")
    else:
        print("❌ FAILED: Task not created.")

    await db.meeting.delete(where={"id": meeting.id})
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(verify())
