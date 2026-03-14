from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.database import db
from app.schemas.employee import Employee, EmployeeCreate
from prisma.models import Employee as PrismaEmployee

router = APIRouter(prefix="/employees", tags=["employees"])

@router.get("/", response_model=List[Employee])
async def get_employees():
    return await db.employee.find_many()

@router.post("/", response_model=Employee, status_code=201)
async def create_employee(employee: EmployeeCreate):
    # Check if emp_id already exists
    existing = await db.employee.find_unique(where={"emp_id": employee.emp_id})
    if existing:
        raise HTTPException(status_code=400, detail=f"Employee ID {employee.emp_id} already exists")
    
    return await db.employee.create(
        data={
            "name": employee.name,
            "emp_id": employee.emp_id,
            "email": employee.email,
            "department": employee.department,
            "github_username": employee.github_username,
            "jira_account_id": employee.jira_account_id,
            "role": employee.role,
            "avatar_url": employee.avatar_url,
        }
    )

@router.delete("/{id}", status_code=204)
async def delete_employee(id: str):
    try:
        await db.employee.delete(where={"id": id})
    except:
        raise HTTPException(status_code=404, detail="Employee not found")
