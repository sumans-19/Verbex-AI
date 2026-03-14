import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def check_platforms():
    # 1. Check GitHub Issues
    github_token = os.getenv("GITHUB_TOKEN")
    owner = os.getenv("GITHUB_REPO_OWNER")
    repo = os.getenv("GITHUB_REPO_NAME")
    
    headers = {"Authorization": f"token {github_token}"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://api.github.com/repos/{owner}/{repo}/issues", headers=headers)
        if resp.status_code == 200:
            issues = resp.json()
            print(f"GitHub Issues in {owner}/{repo}: {len(issues)}")
            for i in issues:
                print(f"- #{i['number']}: {i['title']} ({i['html_url']})")
        else:
            print(f"GitHub Error: {resp.status_code} {resp.text}")

    # 2. Check Jira Projects
    email = os.getenv("JIRA_EMAIL")
    token = os.getenv("JIRA_API_TOKEN")
    domain = os.getenv("JIRA_DOMAIN")
    
    auth = httpx.BasicAuth(email, token)
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://{domain}.atlassian.net/rest/api/3/project", auth=auth)
        if resp.status_code == 200:
            projects = resp.json()
            print(f"\nJira Projects in {domain}:")
            for p in projects:
                print(f"- {p['key']}: {p['name']} (ID: {p['id']})")
        else:
            print(f"\nJira Error: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    asyncio.run(check_platforms())
