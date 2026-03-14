import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def seed_team():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL not found in .env")
        return

    if "?schema=" in db_url:
        db_url = db_url.split("?")[0]

    team_members = [
        {
            "name": "Suman S",
            "email": "sumanshanthakumar@gmail.com",
            "github": "sumans-19",
            "jira": "sumanshanthakumar",
            "emp_id": "EMP001"
        },
        {
            "name": "Likhith Gowda M",
            "email": "likithgowdam10@gmail.com",
            "github": "likithgowdam10",
            "jira": "likithgowdam10",
            "emp_id": "EMP002"
        },
        {
            "name": "J Hemanth",
            "email": "jhemanth4852@gmail.com",
            "github": "hemanthj79",
            "jira": "jhemanth4852",
            "emp_id": "EMP003"
        },
        {
            "name": "Nandi Prasad K M",
            "email": "nandiprasadkm18@gmail.com",
            "github": "nandiprasadkm18",
            "jira": "nandiprasadkm18",
            "emp_id": "EMP004"
        }
    ]

    print(f"Connecting to database to seed {len(team_members)} members...")
    try:
        conn = await asyncpg.connect(db_url)
        
        for member in team_members:
            # Check for existing
            existing = await conn.fetchrow("SELECT id FROM employees WHERE email = $1", member["email"])
            
            if existing:
                print(f"Updating {member['name']}...")
                await conn.execute(
                    """
                    UPDATE employees 
                    SET name = $1, github_username = $2, jira_account_id = $3, emp_id = $4, role = 'engineer', department = 'Engineering'
                    WHERE id = $5
                    """,
                    member["name"], member["github"], member["jira"], member["emp_id"], existing["id"]
                )
            else:
                print(f"Creating {member['name']}...")
                await conn.execute(
                    """
                    INSERT INTO employees (id, name, emp_id, email, github_username, jira_account_id, role, department, created_at)
                    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'engineer', 'Engineering', now())
                    """,
                    member["name"], member["emp_id"], member["email"], member["github"], member["jira"]
                )
        
        print("✅ Team seeding complete!")
        await conn.close()
    except Exception as e:
        print(f"❌ Seeding error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(seed_team())
