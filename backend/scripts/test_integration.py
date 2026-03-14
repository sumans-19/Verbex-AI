import asyncio
import os
from prisma import Prisma
from app.services.integration_service import push_task_to_integrations
from dotenv import load_dotenv

load_dotenv()

async def test_push():
    db = Prisma()
    await db.connect()
    
    # Find an approved task
    task = await db.task.find_first(
        where={"status": "approved"}
    )
    
    if not task:
        # If no approved task, just take any task and make it approved for testing
        task = await db.task.find_first()
        if task:
            print(f"No approved task found. Testing with task: {task.title}")
        else:
            print("No tasks found at all.")
            await db.disconnect()
            return
    else:
        print(f"Testing push for approved task: {task.title}")

    result = await push_task_to_integrations(task.id, db)
    print("\n--- PUSH RESULT ---")
    import json
    print(json.dumps(result, indent=2))
    
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(test_push())
