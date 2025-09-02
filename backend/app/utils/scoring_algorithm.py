from typing import Dict

class CandidateScorer:
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or {
            'technical_skills': 0.3,
            'experience': 0.25,
            'education': 0.2,
            'soft_skills': 0.15,
            'portfolio': 0.1
        }
    
    def calculate_score(self, candidate_data: Dict) -> float:
        """
        Calculate overall score for a candidate based on multiple criteria
        This is a simplified version for the initial implementation
        """
        # For now, return a mock score between 70-95
        # In a real implementation, this would analyze the candidate data
        import random
        return round(random.uniform(70, 95), 1)