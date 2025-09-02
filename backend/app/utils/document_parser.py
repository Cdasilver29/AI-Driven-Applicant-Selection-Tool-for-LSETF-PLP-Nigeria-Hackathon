import PyPDF2
import docx
import re
from typing import Dict

class DocumentParser:
    def parse_document(self, file_path: str) -> Dict:
        if file_path.endswith('.pdf'):
            text = self.extract_text_from_pdf(file_path)
        elif file_path.endswith('.docx'):
            text = self.extract_text_from_docx(file_path)
        else:
            raise ValueError("Unsupported file format")
        
        return self.extract_info_from_text(text)
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
    
    def extract_text_from_docx(self, file_path: str) -> str:
        doc = docx.Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    
    def extract_info_from_text(self, text: str) -> Dict:
        # Basic information extraction
        email = self.extract_email(text)
        phone = self.extract_phone(text)
        skills = self.extract_skills(text)
        
        return {
            "email": email,
            "phone": phone,
            "skills": skills,
            "raw_text": text[:1000] + "..." if len(text) > 1000 else text
        }
    
    def extract_email(self, text: str) -> str:
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        return email_match.group(0) if email_match else ""
    
    def extract_phone(self, text: str) -> str:
        phone_match = re.search(r'(\+?[\d\s\-\(\)]{10,})', text)
        return phone_match.group(0) if phone_match else ""
    
    def extract_skills(self, text: str) -> list:
        skills_keywords = [
            'python', 'javascript', 'java', 'c++', 'php', 'ruby', 'go', 'swift',
            'html', 'css', 'react', 'angular', 'vue', 'django', 'flask', 'node.js',
            'sql', 'mysql', 'postgresql', 'mongodb', 'aws', 'azure', 'gcp', 'docker',
            'kubernetes', 'terraform', 'machine learning', 'ai', 'data analysis'
        ]
        
        found_skills = []
        text_lower = text.lower()
        
        for skill in skills_keywords:
            if skill in text_lower:
                found_skills.append(skill)
        
        return found_skills