import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def fix_status():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL not found")
        return
    
    if "?schema=" in db_url:
        db_url = db_url.split("?")[0]
        
    try:
        conn = await asyncpg.connect(db_url)
        res = await conn.execute("UPDATE tasks SET status = 'approved' WHERE status = 'pushed'")
        print(f"✅ Success: {res}")
        await conn.close()
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(fix_status())
