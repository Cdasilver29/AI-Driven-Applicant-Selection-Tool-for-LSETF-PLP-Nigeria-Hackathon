from typing import Dict, List
import numpy as np

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
        """Calculate overall score for a candidate"""
        scores = {
            'technical_skills': self._score_technical_skills(candidate_data.get('skills', [])),
            'experience': self._score_experience(candidate_data.get('experience', [])),
            'education': self._score_education(candidate_data.get('education', [])),
            'soft_skills': self._score_soft_skills(candidate_data.get('raw_text', '')),
            'portfolio': self._score_portfolio(candidate_data)
        }
        
        # Calculate weighted sum
        total_score = sum(scores[category] * self.weights[category] 
                         for category in self.weights)
        
        # Ensure score is between 0 and 100
        return min(max(total_score, 0), 100)
    
    def _score_technical_skills(self, skills: List[Dict]) -> float:
        """Score technical skills based on relevance and quantity"""
        if not skills:
            return 0
        
        # Score based on number of skills and their relevance
        base_score = min(len(skills) * 5, 50)  # Max 50 points for quantity
        
        # Additional points for specific high-demand skills
        high_demand_skills = ['python', 'javascript', 'react', 'aws', 'docker']
        high_demand_count = sum(1 for skill in skills 
                               if skill['name'] in high_demand_skills)
        
        bonus_score = high_demand_count * 5
        
        return min(base_score + bonus_score, 100)
    
    def _score_experience(self, experience: List[Dict]) -> float:
        """Score based on work experience"""
        if not experience:
            return 0
        
        # Simplified scoring based on number of experience entries
        return min(len(experience) * 15, 100)
    
    def _score_education(self, education: List[Dict]) -> float:
        """Score based on education"""
        if not education:
            return 0
        
        # Score based on highest degree level (simplified)
        degree_scores = {
            'phd': 100,
            'masters': 85,
            'bachelor': 70,
            'diploma': 50,
            'certificate': 30
        }
        
        # Default score if no degree level detected
        return degree_scores.get('bachelor', 70)
    
    def _score_soft_skills(self, text: str) -> float:
        """Score soft skills based on text analysis"""
        if not text:
            return 0
        
        soft_skill_keywords = {
            'communication': ['communicate', 'present', 'write', 'speak', 'explain'],
            'leadership': ['lead', 'manage', 'direct', 'coordinate', 'supervise'],
            'problem_solving': ['solve', 'analyze', 'debug', 'troubleshoot', 'resolve'],
            'teamwork': ['team', 'collaborate', 'partner', 'work together']
        }
        
        text_lower = text.lower()
        score = 0
        
        for skill, keywords in soft_skill_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                score += 20  # 20 points per detected soft skill category
        
        return min(score, 100)
    
    def _score_portfolio(self, candidate_data: Dict) -> float:
        """Score portfolio (simplified)"""
        # Placeholder implementation
        # In a real system, this would analyze GitHub profiles, projects, etc.
        text = candidate_data.get('raw_text', '').lower()
        
        portfolio_indicators = ['github', 'portfolio', 'project', 'repository', 'gitlab']
        indicator_count = sum(1 for indicator in portfolio_indicators 
                             if indicator in text)
        
        return min(indicator_count * 20, 100)