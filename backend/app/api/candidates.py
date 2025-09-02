from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os
from app.services.ai_processor import process_resume

router = APIRouter()

@router.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    processed_candidates = []
    
    for file in files:
        # Save uploaded file temporarily
        file_path = f"/tmp/{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Process the file
        candidate_data = await process_resume(file_path)
        processed_candidates.append(candidate_data)
        
        # Clean up temporary file
        os.remove(file_path)
    
    return {"candidates": processed_candidates}

@router.get("/candidates")
async def get_candidates():
    # Return stored candidates (you'll need to implement storage)
    return {"candidates": []}