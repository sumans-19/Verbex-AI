import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def reset_and_seed():
    db_url = os.getenv("DATABASE_URL").split("?")[0]
    conn = await asyncpg.connect(db_url)
    
    print("🗑️  Cleaning all employees...")
    # Using execute_raw equivalents
    await conn.execute("DELETE FROM employees")
    
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

    print(f"Seeding {len(team_members)} new members...")
    for member in team_members:
        await conn.execute(
            """
            INSERT INTO employees (id, name, emp_id, email, github_username, jira_account_id, role, department, created_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'engineer', 'Engineering', now())
            """,
            member["name"], member["emp_id"], member["email"], member["github"], member["jira"]
        )
    
    print("✅ RESET AND SEED COMPLETE!")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(reset_and_seed())
