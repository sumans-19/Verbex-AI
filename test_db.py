import asyncio
import asyncpg
import sys

async def test_conn():
    user = "postgres"
    password = "password123"
    database = "meeting_ai_system"
    host = "127.0.0.1"
    
    print(f"Testing connection to {database} on {host} as {user}...")
    try:
        conn = await asyncpg.connect(user=user, password=password, database=database, host=host)
        print("Connection successful!")
        await conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")
        
    # Try another common password
    password = "yourpassword"
    print(f"Testing connection with password: {password}...")
    try:
        conn = await asyncpg.connect(user=user, password=password, database=database, host=host)
        print("Connection successful with 'yourpassword'!")
        await conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
