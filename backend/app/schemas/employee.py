from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EmployeeBase(BaseModel):
    name: str
    emp_id: str
    email: Optional[str] = None
    department: Optional[str] = None
    github_username: Optional[str] = None
    jira_account_id: Optional[str] = None
    role: Optional[str] = "engineer"
    avatar_url: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
