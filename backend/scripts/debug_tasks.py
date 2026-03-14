import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def check_tasks():
    db_url = os.getenv("DATABASE_URL")
    if "?schema=" in db_url:
        db_url = db_url.split("?")[0]
    
    conn = await asyncpg.connect(db_url)
    
    tasks = await conn.fetch("SELECT id, title, status, github_issue_url, jira_issue_key, assignee_name FROM tasks")
    print(f"Found {len(tasks)} tasks:")
    for t in tasks:
        print(f"- Title: {t['title']}, Status: {t['status']}, Gistur: {t['github_issue_url']}, JiraKey: {t['jira_issue_key']}, Assignee: {t['assignee_name']}")
    
    meetings = await conn.fetch("SELECT id, title, status FROM meetings")
    print(f"\nFound {len(meetings)} meetings:")
    for m in meetings:
        print(f"- Title: {m['title']}, Status: {m['status']}")

    await conn.close()

if __name__ == "__main__":
    asyncio.run(check_tasks())
