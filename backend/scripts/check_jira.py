import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def check_jira():
    email = os.getenv("JIRA_EMAIL")
    token = os.getenv("JIRA_API_TOKEN")
    domain = os.getenv("JIRA_DOMAIN")
    
    auth = httpx.BasicAuth(email, token)
    url = f"https://{domain}.atlassian.net/rest/api/3/project"
    
    print(f"Checking Jira at {url}...")
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, auth=auth)
        if resp.status_code == 200:
            projects = resp.json()
            print(f"Jira Projects found: {len(projects)}")
            for p in projects:
                print(f"- KEY: {p['key']}, Name: {p['name']}")
        else:
            print(f"Jira Error: {resp.status_code}")
            print(f"Response: {resp.text}")

if __name__ == "__main__":
    asyncio.run(check_jira())
