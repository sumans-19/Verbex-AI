import asyncio
import os
from prisma import Prisma
from dotenv import load_dotenv

load_dotenv()

async def main():
    db = Prisma()
    await db.connect()
    try:
        # Get latest meeting
        meeting = await db.meeting.find_first(order={"created_at": "desc"})
        if not meeting:
            print("No meetings found")
            return
        
        print(f"Latest Meeting: {meeting.title} (ID: {meeting.id}, Status: {meeting.status})")
        
        # Get tasks for this meeting
        tasks = await db.task.find_many(where={"meeting_id": meeting.id})
        print(f"Tasks found: {len(tasks)}")
        for t in tasks:
            print(f"  - Task: {t.title}")
            print(f"    Status: {t.status}")
            print(f"    Assignee: {t.assignee_name}")
            print(f"    GitHub URL: {t.github_issue_url}")
            print(f"    Jira Key: {t.jira_issue_key}")
            print(f"    Employee ID: {t.employee_id}")
            
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
