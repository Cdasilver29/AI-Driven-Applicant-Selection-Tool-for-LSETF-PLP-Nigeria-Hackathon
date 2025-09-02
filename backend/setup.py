from setuptools import setup, find_packages

setup(
    name="lsetf-applicant-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "python-multipart==0.0.6",
        "spacy==3.7.2",
        "scikit-learn==1.3.0",
        "pypdf2==3.0.1",
        "python-docx==1.1.0",
        "redis==5.0.1",
        "asyncpg==0.29.0",
        "python-jose[cryptography]==3.3.0",
        "passlib[bcrypt]==1.7.4",
        "python-dotenv==1.0.0",
        "aiofiles==23.2.1",
    ],
    extras_require={
        "dev": [
            "pytest==7.4.3",
            "pytest-asyncio==0.21.1",
            "black==23.11.0",
            "flake8==6.1.0",
            "mypy==1.7.1",
        ]
    },
)