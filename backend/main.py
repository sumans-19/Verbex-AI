from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, SQLModel, create_engine, Session, select

# Models
class Speaker(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    role: str
    initials: str
    color: str
    tasks_owned: int = 0
    decisions_triggered: int = 0
    words_spoken: int = 0
    notable_quote: str

class Meeting(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    host: str
    date_time: datetime
    attendee_count: int
    tasks_count: int
    decisions_count: int
    stale_count: int = 0
    health_score: int
    status: str = "completed"

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    meeting_id: int
    assignee_name: str
    assignee_initials: str
    assignee_color: str
    confidence: float
    priority: str  # high, medium, low
    status: str  # auto-pushed, pending-review, discarded, stale
    is_ambiguous: bool = False
    transcript_quote: Optional[str] = None
    days_overdue: Optional[int] = None
    mentioned_in_meeting_id: Optional[int] = None

class Decision(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    transcript_quote: str
    meeting_name: str
    date_time: datetime
    decided_by: str
    contradicts_decision_id: Optional[int] = None
    contradiction_warning: Optional[str] = None

# Database Setup
sqlite_url = "sqlite:///./meetsync.db"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def seed_data():
    with Session(engine) as session:
        # Check if already seeded
        if session.exec(select(Speaker)).first():
            return

        # Seed Speakers
        speakers = [
            Speaker(name="Arjun Mehta", role="Engineering Manager", initials="AM", color="green", tasks_owned=3, decisions_triggered=5, words_spoken=1200, notable_quote="Let's make sure the rate limiting is done before Tuesday..."),
            Speaker(name="Rahul Kumar", role="Backend Engineer", initials="RK", color="blue", tasks_owned=4, decisions_triggered=2, words_spoken=850, notable_quote="I'll take the login bug and the rate limiting, should be done by EOD tomorrow"),
            Speaker(name="Priya Nair", role="Tech Lead", initials="PN", color="orange", tasks_owned=3, decisions_triggered=6, words_spoken=950, notable_quote="The auth service needs Postgres, we can't keep patching MySQL"),
            Speaker(name="Kiran Dev", role="Frontend Engineer", initials="KD", color="purple", tasks_owned=2, decisions_triggered=3, words_spoken=600, notable_quote="Dashboard widget redesign is on me, I'll have a mockup by Thursday"),
        ]
        for s in speakers: session.add(s)

        # Seed Meetings
        meetings = [
            Meeting(title="Sprint 24 Planning", host="Arjun Mehta", date_time=datetime.now(), attendee_count=8, tasks_count=8, decisions_count=3, health_score=91),
            Meeting(title="Architecture Review", host="Priya Nair", date_time=datetime.now() - timedelta(days=1), attendee_count=5, tasks_count=5, decisions_count=6, stale_count=1, health_score=78),
            Meeting(title="Design Review", host="Kiran Dev", date_time=datetime.now() - timedelta(days=2), attendee_count=4, tasks_count=4, decisions_count=2, health_score=65),
        ]
        for m in meetings: session.add(m)
        session.commit()

        # Seed Tasks
        tasks = [
            Task(title="Fix login bug before release", description="We need to fix the login bug before the next release...", meeting_id=1, assignee_name="Rahul Kumar", assignee_initials="RK", assignee_color="blue", confidence=0.94, priority="high", status="auto-pushed"),
            Task(title="Implement API rate limiting", description="Add rate limiting to all public endpoints...", meeting_id=1, assignee_name="Rahul Kumar", assignee_initials="RK", assignee_color="blue", confidence=0.88, priority="high", status="auto-pushed"),
            Task(title="Look into performance bottleneck", description="Investigation required for high latency in auth...", meeting_id=2, assignee_name="Unassigned", assignee_initials="?", assignee_color="gray", confidence=0.41, priority="low", status="discarded"),
            Task(title="Set up staging environment", description="Environment setup for integration testing...", meeting_id=2, assignee_name="Rahul Kumar", assignee_initials="RK", assignee_color="blue", confidence=0.76, priority="high", status="stale", days_overdue=14, mentioned_in_meeting_id=1),
            Task(title="Update API documentation", description="Pending review of new endpoints...", meeting_id=2, assignee_name="Priya Nair", assignee_initials="PN", assignee_color="orange", confidence=0.67, priority="medium", status="pending-review", is_ambiguous=True, transcript_quote="someone should look into the auth stuff before we ship")
        ]
        for t in tasks: session.add(t)

        # Seed Decisions
        decisions = [
            Decision(title="Switch from MySQL to PostgreSQL for the auth service", transcript_quote="After reviewing the benchmarks, we're going with Postgres. MySQL is out.", meeting_name="Architecture Review", date_time=datetime.now() - timedelta(days=1), decided_by="Priya Nair"),
            Decision(title="Use Redux for state management", transcript_quote="Let's stick with Redux for now.", meeting_name="Design Review", date_time=datetime.now() - timedelta(days=2), decided_by="Kiran Dev", contradiction_warning="Contradicts earlier decision: We decided to drop Redux last sprint"),
        ]
        for d in decisions: session.add(d)
        session.commit()

# FastAPI App
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    seed_data()

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    return {
        "meetings": {"value": 24, "delta": "+4", "color": "green"},
        "tasks": {"value": 87, "delta": "+12", "color": "blue"},
        "decisions": {"value": 31, "delta": "0", "color": "orange"},
        "stale_tasks": {"value": 3, "delta": "Critical", "color": "red"},
        "confidence": {"value": "82%", "delta": "+5%", "color": "purple"}
    }

@app.get("/api/meetings")
def get_meetings():
    with Session(engine) as session:
        return session.exec(select(Meeting)).all()

@app.get("/api/tasks")
def get_tasks(status: Optional[str] = None):
    with Session(engine) as session:
        statement = select(Task)
        if status:
            statement = statement.where(Task.status == status)
        return session.exec(statement).all()

@app.get("/api/decisions")
def get_decisions():
    with Session(engine) as session:
        return session.exec(select(Decision)).all()

@app.get("/api/speakers")
def get_speakers():
    with Session(engine) as session:
        return session.exec(select(Speaker)).all()

@app.get("/api/stale-tasks")
def get_stale_tasks():
    with Session(engine) as session:
        return session.exec(select(Task).where(Task.status == "stale")).all()

@app.post("/api/ingest")
def ingest_meeting():
    import time
    # This is a dummy endpoint to simulate processing
    return {"status": "processing"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
