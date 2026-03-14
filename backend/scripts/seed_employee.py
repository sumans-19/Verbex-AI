import asyncio
import os
import asyncpg
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def seed_master_employee():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL not found in .env")
        return

    # Handle SQLAlchemy/Prisma URLs that might have ?schema=...
    if "?schema=" in db_url:
        db_url = db_url.split("?")[0]

    github_user = os.getenv("GITHUB_REPO_OWNER")
    jira_email = os.getenv("JIRA_EMAIL")
    
    master_name = "Suman S."
    master_emp_id = "MASTER001"
    
    print(f"Propagating master employee via asyncpg: {master_name}...")

    try:
        conn = await asyncpg.connect(db_url)
        
        # Check if table exists (it should, after prisma db push or similar)
        # We assume the schema is already partially there from previous steps
        
        # Check for existing email
        existing = await conn.fetchrow("SELECT id FROM employees WHERE email = $1", jira_email)
        
        if existing:
            print(f"Employee with email {jira_email} exists. Updating...")
            await conn.execute(
                """
                UPDATE employees 
                SET name = $1, github_username = $2, role = 'Tech Lead'
                WHERE id = $3
                """,
                master_name, github_user, existing['id']
            )
        else:
            # Insert new
            print(f"Creating new master employee...")
            await conn.execute(
                """
                INSERT INTO employees (id, name, emp_id, email, github_username, role, department, created_at)
                VALUES (gen_random_uuid(), $1, $2, $3, $4, 'Tech Lead', 'Engineering', now())
                """,
                master_name, master_emp_id, jira_email, github_user
            )
        
        print(f"✅ Master employee setup complete!")
        await conn.close()
    except Exception as e:
        print(f"❌ Database error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(seed_master_employee())
