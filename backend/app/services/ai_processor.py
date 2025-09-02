import asyncio
from typing import Dict
from app.utils.scoring_algorithm import CandidateScorer

# Initialize the scorer
scorer = CandidateScorer()

async def process_resume(file_path: str) -> Dict:
    """
    Mock resume processing function
    Replace this with actual AI processing logic
    """
    # Simulate processing time
    await asyncio.sleep(2)
    
    # Extract filename for mock data
    filename = file_path.split('_')[-1] if '_' in file_path else file_path
    name = filename.replace('.pdf', '').replace('.docx', '').replace('_', ' ').title()
    
    # Generate mock candidate data
    candidate_data = {
        "id": f"candidate_{hash(file_path)}",
        "name": name,
        "email": f"{name.lower().replace(' ', '.')}@example.com",
        "score": scorer.calculate_score({}),
        "skills": ["Python", "JavaScript", "React", "Node.js"],
        "experience": "3+ years",
        "education": "BSc Computer Science",
        "status": "processed"
    }
    
    return candidate_data