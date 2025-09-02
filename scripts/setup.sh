#!/bin/bash

echo "Setting up LSETF AI Applicant Selection Tool..."

# Create Python virtual environments
echo "Creating Python virtual environments..."
python -m venv backend/venv
python -m venv ai-engine/venv

# Install backend dependencies
echo "Installing backend dependencies..."
source backend/venv/bin/activate
pip install -r backend/requirements.txt
deactivate

# Install AI engine dependencies
echo "Installing AI engine dependencies..."
source ai-engine/venv/bin/activate
pip install -r ai-engine/requirements.txt
python -m spacy download en_core_web_sm
deactivate

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Setup complete!"
echo "To start the application, run: docker-compose up"