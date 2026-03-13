import json
import google.generativeai as genai
from ..config import settings
from .transcription import clean_transcript

def setup_gemini():
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is missing")
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel(settings.GEMINI_MODEL)

async def process_transcript_with_gemini(transcript: str, meeting_title: str, host_name: str):
    cleaned_transcript = clean_transcript(transcript)
    
    system_prompt = f"""
You are an expert meeting analyst for engineering teams.
Read the transcript and extract all tasks and decisions precisely.
Meeting: {meeting_title}
Host: {host_name}

TASK = something someone must DO after this meeting ends
- Must have an action verb: fix, build, write, implement, review, update, create, test, deploy
- Must have an owner who committed to it or was assigned it
- Must be specific and bounded, not vague like "think about it"
- Priority HIGH = deadline mentioned, blocking others, or production issue
- Priority MEDIUM = important but no hard deadline
- Priority LOW = nice to have or future consideration

DECISION = something the group CONCLUDED and AGREED ON during the meeting
- Uses words like: decided, agreed, going with, confirmed, final call, approved, we will
- Already resolved — no further action needed from anyone
- Clearly different from a task — nobody needs to DO anything new

CONFIDENCE SCORE:
0.90-1.00 = named owner + clear specific action + explicit in transcript
0.75-0.89 = clear action + owner strongly implied from context
0.50-0.74 = action or owner is ambiguous — needs human review
0.00-0.49 = vague or speculative — will be discarded automatically

Return ONLY raw valid JSON. Zero markdown. Zero explanation. Zero preamble.
Exact structure:
{{
  "tldr": "one sentence capturing the single most important outcome",
  "health_score": <float 0 to 100>,
  "tasks": [
    {{
      "title": "<clear action title, under 10 words>",
      "description": "<1-2 sentences of context from the meeting>",
      "priority": "high or medium or low",
      "confidence_score": <float 0.0 to 1.0>,
      "assignee_name": "<full name of the person responsible, null if unknown>",
      "owner_emp_id": "<employee ID if mentioned (e.g. BE102), null if unknown>",
      "owner_dept": "<department name if mentioned (e.g. Backend Engineering), null if unknown>",
      "source_quote": "<exact words from transcript proving this task and ownership>"
    }}
  ],
  "decisions": [
    {{
      "title": "<clear decision title, under 10 words>",
      "description": "<1-2 sentences of what was decided and why>",
      "decided_by_name": "<name of person who announced or made the decision, null if group>",
      "source_quote": "<exact words from transcript proving this decision>"
    }}
  ]
}}
"""

    prompt = f"{system_prompt}\n\nTRANSCRIPT:\n{cleaned_transcript}"

    # --- PHASE 1: Try Gemini ---
    try:
        model = setup_gemini()
        response = await model.generate_content_async(prompt)
        text = response.text.strip()
        print("DEBUG: Analysis successful via Gemini")
        return _parse_ai_json(text)
    except Exception as e:
        print(f"DEBUG: Gemini Analysis failed: {str(e)}. Falling back to Groq...")

    # --- PHASE 2: Fallback to Groq ---
    if not settings.GROQ_API_KEY:
        raise RuntimeError("Both Gemini and Groq AI services are unavailable.")

    import httpx
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY.strip()}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": settings.GROQ_MODEL or "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are a specialized JSON meeting analyst. Output ONLY raw JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "response_format": {"type": "json_object"}
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            res_data = resp.json()
            text = res_data["choices"][0]["message"]["content"].strip()
            print("DEBUG: Analysis successful via Groq Fallback")
            return _parse_ai_json(text)
    except Exception as groq_err:
        print(f"DEBUG: Groq Analysis fallback failed: {str(groq_err)}")
        return {
            "tldr": f"AI Error: {str(groq_err)}",
            "health_score": 0,
            "tasks": [],
            "decisions": []
        }

def _parse_ai_json(text: str) -> dict:
    """Helper to clean and parse JSON from AI response"""
    # Strip markdown fences if present
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    
    if text.endswith("```"):
        text = text[:-3]
    
    text = text.strip()
    
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Emergency backup: if it's really messy, just return empty
        return {
            "tldr": "Post-processing error: invalid JSON from AI",
            "health_score": 0,
            "tasks": [],
            "decisions": []
        }
