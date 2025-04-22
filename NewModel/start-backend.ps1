# PowerShell script to activate the virtual environment and start the backend server

# Change to the backend directory
cd $PSScriptRoot\backend

# Activate the virtual environment
.\venv\Scripts\Activate

# Start the backend server
python -m uvicorn app.main:app --reload

Write-Host "Backend server started at http://127.0.0.1:8000" 