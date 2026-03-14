import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def check_github_detail():
    github_token = os.getenv("GITHUB_TOKEN")
    owner = os.getenv("GITHUB_REPO_OWNER")
    repo = os.getenv("GITHUB_REPO_NAME")
    
    headers = {"Authorization": f"token {github_token}"}
    async with httpx.AsyncClient() as client:
        # Get latest issue
        resp = await client.get(f"https://api.github.com/repos/{owner}/{repo}/issues?state=all&sort=created&direction=desc", headers=headers)
        if resp.status_code == 200:
            issues = resp.json()
            if issues:
                latest = issues[0]
                print(f"Latest Issue at {owner}/{repo}:")
                print(f"- Number: #{latest['number']}")
                print(f"- Title: {latest['title']}")
                print(f"- State: {latest['state']}")
                print(f"- Created At: {latest['created_at']}")
                print(f"- URL: {latest['html_url']}")
            else:
                print(f"No issues found in {owner}/{repo}")
        else:
            print(f"GitHub Error: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    asyncio.run(check_github_detail())
