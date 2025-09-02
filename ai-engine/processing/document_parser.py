import PyPDF2
import docx
import re
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class DocumentParser:
    def __init__(self):
        self.skill_keywords = {
            'programming': ['python', 'javascript', 'java', 'c++', 'php', 'ruby', 'go', 'swift'],
            'web': ['html', 'css', 'react', 'angular', 'vue', 'django', 'flask', 'node.js'],
            'data': ['sql', 'mysql', 'postgresql', 'mongodb', 'bigquery', 'tableau', 'powerbi'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform']
        }
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise
    
    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {e}")
            raise
    
    def parse_resume(self, text: str) -> Dict:
        """Parse resume text and extract structured information"""
        # Extract email
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        email = email_match.group(0) if email_match else ""
        
        # Extract phone number
        phone_match = re.search(r'(\+?[\d\s\-\(\)]{10,})', text)
        phone = phone_match.group(0) if phone_match else ""
        
        # Extract skills
        skills = self.extract_skills(text)
        
        # Extract experience (simplified)
        experience = self.extract_experience(text)
        
        # Extract education
        education = self.extract_education(text)
        
        return {
            "email": email,
            "phone": phone,
            "skills": skills,
            "experience": experience,
            "education": education,
            "raw_text": text
        }
    
    def extract_skills(self, text: str) -> List[Dict]:
        """Extract skills from text"""
        skills = []
        text_lower = text.lower()
        
        for category, keywords in self.skill_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    skills.append({
                        "name": keyword,
                        "category": category,
                        "confidence": 0.8  # Placeholder for actual confidence calculation
                    })
        
        return skills
    
    def extract_experience(self, text: str) -> List[Dict]:
        """Extract work experience from text (simplified)"""
        # This is a simplified implementation
        # A real implementation would use more sophisticated NLP
        experience = []
        lines = text.split('\n')
        
        for line in lines:
            if any(keyword in line.lower() for keyword in ['experience', 'work', 'employment']):
                # Simplified: assume lines near experience headers contain experience info
                experience.append({
                    "title": "Extracted Position",
                    "company": "Extracted Company",
                    "duration": "Extracted Duration",
                    "description": line
                })
        
        return experience
    
    def extract_education(self, text: str) -> List[Dict]:
        """Extract education from text (simplified)"""
        education = []
        lines = text.split('\n')
        
        for line in lines:
            if any(keyword in line.lower() for keyword in ['education', 'degree', 'university', 'college']):
                education.append({
                    "degree": "Extracted Degree",
                    "institution": "Extracted Institution",
                    "year": "Extracted Year"
                })
        
        return education