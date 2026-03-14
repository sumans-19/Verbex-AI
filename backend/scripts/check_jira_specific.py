import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def check_specific_jira():
    email = os.getenv("JIRA_EMAIL")
    token = os.getenv("JIRA_API_TOKEN")
    domain = os.getenv("JIRA_DOMAIN")
    project_key = os.getenv("JIRA_PROJECT_KEY")
    
    auth = httpx.BasicAuth(email, token)
    
    # Check specific project
    url = f"https://{domain}.atlassian.net/rest/api/3/project/{project_key}"
    print(f"Checking Jira Project {project_key} at {url}...")
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, auth=auth)
        if resp.status_code == 200:
            p = resp.json()
            print(f"✅ Found Project: {p['name']} (ID: {p['id']})")
        else:
            print(f"❌ Project Error: {resp.status_code}")
            print(f"Response: {resp.text}")

        # Check Current User (myself)
        url_me = f"https://{domain}.atlassian.net/rest/api/3/myself"
        resp_me = await client.get(url_me, auth=auth)
        if resp_me.status_code == 200:
            me = resp_me.json()
            print(f"✅ Auth Success! User: {me['displayName']} (AccountID: {me['accountId']})")
        else:
            print(f"❌ Myself Error: {resp_me.status_code}")

if __name__ == "__main__":
    asyncio.run(check_specific_jira())
