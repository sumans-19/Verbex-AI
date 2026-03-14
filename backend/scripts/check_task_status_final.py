import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def final_check():
    db_url = os.getenv("DATABASE_URL").split("?")[0]
    conn = await asyncpg.connect(db_url)
    
    print("Distinct Task Statuses:")
    statuses = await conn.fetch("SELECT DISTINCT status FROM tasks")
    for s in statuses:
        print(f"- {s['status']}")
    
    pushed_count = await conn.fetchval("SELECT COUNT(*) FROM tasks WHERE status = 'pushed'")
    print(f"\nTasks with 'pushed' status: {pushed_count}")
    
    total_tasks = await conn.fetchval("SELECT COUNT(*) FROM tasks")
    print(f"Total Tasks: {total_tasks}")
    
    await conn.close()

if __name__ == "__main__":
    asyncio.run(final_check())
