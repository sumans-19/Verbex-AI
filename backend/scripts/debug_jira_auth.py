import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def debug_jira_auth():
    email = os.getenv("JIRA_EMAIL", "").strip()
    token = os.getenv("JIRA_API_TOKEN", "").strip()
    domain = os.getenv("JIRA_DOMAIN", "").strip()
    
    auth = httpx.BasicAuth(email, token)
    
    async with httpx.AsyncClient() as client:
        # Check Myself
        url_me = f"https://{domain}.atlassian.net/rest/api/3/myself"
        print(f"Testing Auth for {email} at {url_me}")
        try:
            resp_me = await client.get(url_me, auth=auth)
            
            print(f"Status Code: {resp_me.status_code}")
            # Only print safe headers
            print(f"WWW-Authenticate: {resp_me.headers.get('WWW-Authenticate')}")
            print(f"Body: {resp_me.text}")

            if resp_me.status_code == 200:
                print("AUTH SUCCESS!")
            else:
                print("AUTH FAILED.")
        except Exception as e:
            print(f"Connection Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(debug_jira_auth())
