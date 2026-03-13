import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    
    # Get the latest meeting
    meeting = await db.meeting.find_first(
        order={"created_at": "desc"},
        include={"tasks": True, "decisions": True}
    )
    
    if meeting:
        print(f"Latest Meeting ID: {meeting.id}")
        print(f"Title: {meeting.title}")
        print(f"Status: {meeting.status}")
        print(f"TLDR: '{meeting.tldr}'")
        print(f"Health Score: {meeting.health_score}")
        print(f"Tasks Count: {len(meeting.tasks)}")
        print(f"Decisions Count: {len(meeting.decisions)}")
    else:
        print("No meetings found")
        
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
