import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def final_check():
    db_url = os.getenv("DATABASE_URL").split("?")[0]
    conn = await asyncpg.connect(db_url)
    
    print("--- CURRENT REGISTERED TEAM MEMBERS ---")
    rows = await conn.fetch("SELECT name, email, github_username, jira_account_id FROM employees")
    for r in rows:
        print(f"Name:   {r['name']}")
        print(f"   Email:  {r['email']}")
        print(f"   GitHub: {r['github_username']}")
        print(f"   Jira:   {r['jira_account_id']}")
        print("-" * 30)
    
    await conn.close()

if __name__ == "__main__":
    asyncio.run(final_check())
