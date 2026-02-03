# BudgetWise - Personal Finance Tracker
A full-stack web application for managing personal finances with budgeting, transaction tracking, goal setting, and AI powered insights.
🎯 Project Overview
BudgetWise helps users take control of their finances by:

Tracking income and expenses across accounts
Setting and monitoring budgets by category
Creating and achieving savings goals
Getting AI powered financial insights
Simulating realistic bank transactions for testing

🛠️ Tech Stack
Frontend

React 18.2+ with TypeScript
React Router for navigation
Axios for API communication
Inline CSS for styling

Backend

Python 3.12
FastAPI for REST API
JWT for authentication
Pydantic for data validation
JSON files for local data storage (no database required)

📋 Prerequisites
Before you begin, ensure you have installed:

Node.js 18+ and npm
Python 3.12 (NOT 3.13 or 3.14)
Git

🚀 Getting Started
1. Clone the Repository
bashgit clone <your-repo-url>
cd budgetWise
2. Backend Setup
Windows (PowerShell):
powershell# Navigate to backend folder
cd backend

# Create virtual environment with Python 3.12
py -3.12 -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you get execution policy error, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
Copy-Item .env.example .env

# Edit .env and set your SECRET_KEY (any random string 32+ characters)
# Example: SECRET_KEY=budgetwiseai_secret_key_change_this_in_production

# Create data directory and initialize JSON files
mkdir data -ErrorAction SilentlyContinue
Set-Content -Path "data\users.json" -Value "[]"
Set-Content -Path "data\transactions.json" -Value "[]"
Set-Content -Path "data\budgets.json" -Value "[]"
Set-Content -Path "data\goals.json" -Value "[]"

# Start the backend server
uvicorn app.main:app --reload --port 8000
Mac/Linux:
bash# Navigate to backend folder
cd backend

# Create virtual environment
python3.12 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and set your SECRET_KEY
nano .env

# Create data directory and initialize JSON files
mkdir -p data
echo "[]" > data/users.json
echo "[]" > data/transactions.json
echo "[]" > data/budgets.json
echo "[]" > data/goals.json

# Start the backend server
uvicorn app.main:app --reload --port 8000
Backend should now be running at: http://localhost:8000
API Documentation: http://localhost:8000/docs

3. Frontend Setup
Open a new terminal (keep backend running):
Windows (PowerShell):
powershell# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env

# Start the development server
npm start
Mac/Linux:
bash# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the development server
npm start
Frontend should now be running at: http://localhost:3000

📁 Project Structure
budgetWise/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.py           # Authentication endpoints
│   │   │   │   │   └── transactions.py   # Transaction endpoints
│   │   │   │   └── api.py                # API router
│   │   │   └── deps.py                   # Dependencies (auth, db)
│   │   ├── core/
│   │   │   ├── config.py                 # Configuration settings
│   │   │   └── security.py               # JWT & password hashing
│   │   ├── models/
│   │   │   ├── user.py                   # User data model
│   │   │   └── transaction.py            # Transaction data model
│   │   ├── schemas/
│   │   │   ├── user.py                   # User validation schemas
│   │   │   ├── transaction.py            # Transaction validation schemas
│   │   │   └── token.py                  # JWT token schemas
│   │   ├── services/
│   │   │   ├── auth_service.py           # Authentication business logic
│   │   │   ├── transaction_service.py    # Transaction business logic
│   │   │   └── bank_simulator_service.py # Fake transaction generator
│   │   ├── storage/
│   │   │   └── json_store.py             # JSON file database
│   │   └── main.py                       # FastAPI application entry
│   ├── data/                             # JSON data files (gitignored)
│   ├── requirements.txt                  # Python dependencies
│   └── .env                              # Environment variables (gitignored)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                   # Reusable components
│   │   │   ├── auth/                     # Auth-related components
│   │   │   ├── dashboard/                # Dashboard widgets
│   │   │   ├── activity/                 # Transaction components
│   │   │   └── budgets/                  # Budget components
│   │   ├── pages/
│   │   │   ├── Login.tsx                 # Login page
│   │   │   ├── Signup.tsx                # Signup page
│   │   │   └── Dashboard.tsx             # Main dashboard
│   │   ├── services/
│   │   │   ├── api.ts                    # Axios configuration
│   │   │   └── auth.service.ts           # Auth API calls
│   │   ├── context/
│   │   │   └── AuthContext.tsx           # Global auth state
│   │   ├── types/
│   │   │   └── auth.types.ts             # TypeScript types
│   │   ├── routes.tsx                    # React Router setup
│   │   └── App.tsx                       # Main app component
│   ├── package.json
│   └── .env                              # Frontend env vars (gitignored)
│
└── README.md

🔐 Environment Variables
Backend .env
envSECRET_KEY=your-super-secret-key-at-least-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=http://localhost:3000
DATA_DIR=./data
Frontend .env
envREACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development

🧪 Testing the Application
1. Create a Test Account

Open http://localhost:3000/signup
Fill in the form:

Username: testuser
First Name: John
Last Name: Doe
Email: john@example.com
Password: Test123!@# (must meet requirements)


Click "Sign Up"

2. Login

You'll be redirected to login automatically after signup
Or go to http://localhost:3000/login
Enter credentials and login

3. Generate Sample Transactions
Option A: Via API Docs (Recommended)

Go to http://localhost:8000/docs
Click "Authorize" button (🔒 icon)
Login to get your token (POST /api/v1/auth/login)
Copy the access_token
Click "Authorize" again and paste: Bearer YOUR_TOKEN_HERE
Find POST /api/v1/transactions/generate-sample
Set count to 30
Click "Execute"

Option B: Via curl
bash# First login to get token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "Test123!@#"}'

# Copy the access_token from response

# Generate transactions
curl -X POST "http://localhost:8000/api/v1/transactions/generate-sample?count=30" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
4. View Transactions

Go to http://localhost:8000/docs
Try GET /api/v1/transactions/ (shows all transactions)
Try GET /api/v1/transactions/balance (shows total balance)
Try filtering: GET /api/v1/transactions/?category=Groceries


📝 API Endpoints
Authentication
MethodEndpointDescriptionPOST/api/v1/auth/signupCreate new user accountPOST/api/v1/auth/loginLogin and get JWT tokenGET/api/v1/auth/meGet current user info (requires auth)
Transactions
MethodEndpointDescriptionGET/api/v1/transactions/Get all user transactions (with filters)GET/api/v1/transactions/balanceGet account balanceGET/api/v1/transactions/{id}Get specific transactionPOST/api/v1/transactions/Create new transactionPUT/api/v1/transactions/{id}Update transactionDELETE/api/v1/transactions/{id}Delete transactionPOST/api/v1/transactions/generate-sampleGenerate fake transactions

🐛 Troubleshooting
Backend Issues
Problem: uvicorn: command not found
powershell# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Reinstall uvicorn
pip install uvicorn
Problem: ImportError: cannot import name 'X'

Check that all files are created in the correct location
Make sure file names match exactly (case-sensitive)
Restart the server

Problem: bcrypt or pydantic errors
powershellpip uninstall bcrypt pydantic pydantic-core -y
pip install bcrypt==4.0.1 pydantic==2.8.0
Frontend Issues
Problem: npm install fails
bash# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
Problem: CORS errors in browser

Make sure backend .env has: BACKEND_CORS_ORIGINS=http://localhost:3000
Restart backend server

Problem: Can't login/signup

Check browser console for errors
Make sure backend is running on port 8000
Check network tab in browser dev tools


👥 Team Workflow
Working on Features

Pull latest changes:

bash   git pull origin main

Create a feature branch:

bash   git checkout -b feature/your-feature-name

Make your changes and commit:

bash   git add .
   git commit -m "Add: description of changes"

Push and create pull request:

bash   git push origin feature/your-feature-name
Running Teammate's Code

Pull their branch:

bash   git fetch
   git checkout their-branch-name

Install any new dependencies:

bash   # Backend
   cd backend
   pip install -r requirements.txt

   # Frontend
   cd frontend
   npm install

Run both servers as described in Getting Started


📦 Dependencies
Backend (requirements.txt)
txtfastapi==0.115.0
uvicorn[standard]==0.30.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
pydantic==2.8.0
pydantic-settings==2.3.0
python-dotenv==1.0.1
pytest==8.2.0
pytest-asyncio==0.23.0
httpx==0.27.0
bcrypt==4.0.1
Frontend (package.json)
json{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "typescript": "^5.3.0",
    "axios": "^1.6.0"
  }
}
