import httpx
import json
import asyncio
from typing import List, Tuple
from threading import Event
from fastapi import HTTPException
from deepgram import DeepgramClient, LiveTranscriptionEvents, LiveOptions
from ..config import settings

async def transcribe_audio_file(file_path: str) -> str:
    """
    Transcribes audio file using OpenAI Whisper API.
    Returns formatted transcript: [HH:MM:SS] Text
    """
    api_key = settings.OPENAI_API_KEY.strip()
    if not api_key:
        raise ValueError("OPENAI_API_KEY is missing")
    
    url = "https://api.openai.com/v1/audio/transcriptions"
    headers = {"Authorization": f"Bearer {api_key}"}
    
    # Whisper needs sync file handle? The requirement says:
    # "Opens file with open() not aiofiles (Whisper needs sync file handle)"
    # But we are using httpx.AsyncClient. We'll open it synchronously and pass to files.
    
    max_retries = 3
    base_delay = 2 # seconds
    
    async with httpx.AsyncClient(timeout=300.0) as client:
        # --- PHASE 1: Try OpenAI ---
        try:
            for attempt in range(max_retries):
                with open(file_path, "rb") as audio_file:
                    files = {"file": audio_file}
                    data = {
                        "model": "whisper-1",
                        "response_format": "verbose_json",
                        "timestamp_granularities[]": "segment"
                    }
                    
                    response = await client.post(url, headers=headers, files=files, data=data)
                    
                    if response.status_code == 429:
                        if attempt < max_retries - 1:
                            delay = base_delay * (2 ** attempt)
                            print(f"DEBUG: OpenAI 429 Rate Limit. Retrying in {delay}s (Attempt {attempt + 1}/{max_retries})")
                            await asyncio.sleep(delay)
                            continue
                    
                    response.raise_for_status()
                    result = response.json()
                    print("DEBUG: Transcription successful via OpenAI")
                    return _format_whisper_result(result)
        except Exception as e:
            print(f"DEBUG: OpenAI Transcription failed: {str(e)}. Falling back to Groq...")

        # --- PHASE 2: Fallback to Groq ---
        if not settings.GROQ_API_KEY:
            raise ValueError("Both OpenAI and Groq API keys are failing or missing.")
            
        groq_url = "https://api.groq.com/openai/v1/audio/transcriptions"
        groq_headers = {"Authorization": f"Bearer {settings.GROQ_API_KEY.strip()}"}
        
        with open(file_path, "rb") as audio_file:
            files = {"file": audio_file}
            data = {
                "model": "whisper-large-v3",
                "response_format": "verbose_json",
            }
            try:
                response = await client.post(groq_url, headers=groq_headers, files=files, data=data)
                response.raise_for_status()
                result = response.json()
                print("DEBUG: Transcription successful via Groq Fallback")
                return _format_whisper_result(result)
            except Exception as groq_err:
                print(f"DEBUG: Groq Fallback failed: {str(groq_err)}")
                raise HTTPException(status_code=500, detail=f"All transcription services failed. OpenAI: {str(e)}, Groq: {str(groq_err)}")

def _format_whisper_result(result: dict) -> str:
    """Helper to format OpenAI/Groq verbose_json output"""
    segments = result.get("segments", [])
    if not segments:
        return result.get("text", "").strip()
        
    formatted_lines = []
    for segment in segments:
        start_seconds = int(segment.get("start", 0))
        mm, ss = divmod(start_seconds, 60)
        hh, mm = divmod(mm, 60)
        timestamp = f"[{hh:02d}:{mm:02d}:{ss:02d}]"
        text = segment.get("text", "").strip()
        if text:
            formatted_lines.append(f"{timestamp} {text}")
            
    return "\n".join(formatted_lines)

def clean_transcript(raw: str) -> str:
    """
    Strips blank lines and whitespace from each line.
    """
    if not raw:
        return ""
    lines = raw.split("\n")
    cleaned = [line.strip() for line in lines if line.strip()]
    return "\n".join(cleaned)

def create_deepgram_connection(api_key: str):
    """
    Creates Deepgram live connection with exact requirements.
    Returns (connection, transcript_segments, finished_event)
    """
    client = DeepgramClient(api_key)
    transcript_segments = []
    finished_event = Event()
    
    connection = client.listen.live.v("1")
    
    def on_message(self, result, **kwargs):
        sentence = result.channel.alternatives[0].transcript
        if sentence and sentence.strip() != "":
            start_seconds = int(result.start)
            mm, ss = divmod(start_seconds, 60)
            hh, mm = divmod(mm, 60)
            timestamp = f"{hh:02d}:{mm:02d}:{ss:02d}"
            segment_text = f"[{timestamp}] {sentence.strip()}"
            transcript_segments.append(segment_text)
            
            # Note: The caller needs to handle sending this to the WebSocket client
            # We skip it here as this function just sets up the connection object meta
            
    def on_error(self, error, **kwargs):
        # Error handling is done by the caller who has the WS session
        pass
        
    def on_close(self, self_obj, **kwargs):
        finished_event.set()
        
    options = LiveOptions(
        model="nova-2",
        language="en-US",
        punctuate=True,
        interim_results=False,
        utterance_end_ms=1000,
        vad_events=True,
        smart_format=True,
    )
    
    connection.on(LiveTranscriptionEvents.Transcript, on_message)
    connection.on(LiveTranscriptionEvents.Error, on_error)
    connection.on(LiveTranscriptionEvents.Close, on_close)
    
    connection.start(options)
    
    return connection, transcript_segments, finished_event
