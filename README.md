# 💰 BudgetWise - Smart Personal Finance Tracker

## 📖 About
 
BudgetWise is a full-stack personal finance management application built for college students. It connects to a simulated bank (Freedom Bank), automatically syncs transactions, tracks budgets and savings goals, and provides an AI financial advisor powered by Azure AI. Built as a senior capstone project, it demonstrates production-grade web development practices across the full stack.
 
### Why BudgetWise?
 
- 🏦 **Real Bank Integration** — Connects to Freedom Bank (Firebase emulator) to automatically import transactions
- 🤖 **AI Financial Advisor** — Powered by Azure AI Foundry; answers questions, creates goals, and analyzes spending
- 📊 **Smart Budgeting** — Set category-based budgets with real-time progress tracking and over-budget alerts
- 🎯 **Savings Goals** — Create, deposit toward, and track goals; AI can create goals from conversation
- 🏆 **Rewards System** — Earn badges and XP for financial milestones with animated badge cards
- 🔔 **Smart Notifications** — In-app toast notifications and email alerts via SendGrid for budgets, goals, and weekly summaries
- 📈 **Spending Outlook** — AI-powered spending analysis with interactive charts and forecasts
- 🔒 **Secure Auth** — JWT-based authentication with bcrypt password hashing
---
 
## ✨ Features
 
### ✅ Completed Features (v1.0.0)
 
| Feature | Description |
|---|---|
| User Authentication | Signup, login, JWT tokens, password change |
| Bank Integration | Connect Freedom Bank, auto-sync transactions |
| Transaction Management | View, filter, search transactions by category/type |
| Budget Tracking | Create/edit/delete budgets with progress bars and alerts |
| Savings Goals | Create goals, make deposits, track progress |
| AI Assistant | Chat with BudgetWise AI — create goals, analyze finances |
| Spending Outlook | AI spending analysis with bar, line, and pie charts |
| Rewards & XP | Badge system with animations, level progression |
| Notifications | In-app toasts + email notifications with per-event toggles |
| Weekly Scheduler | Automated weekly summary emails every Sunday |
| Goal Reminders | Biweekly automated goal deposit reminder emails |
| Settings | Tabbed settings — details, profile, notifications, danger zone |
| Account Deletion | Full account + data deletion with confirmation |
| Avatar Customization | Color-picker avatar with initials |
| Chat History | Persistent AI chat history stored in MySQL |
 
---
 
## 🛠️ Tech Stack
 
### Frontend
- **React 18.2** with TypeScript
- **React Router** for navigation
- **Axios** for API requests
- **Recharts** for data visualization
- **Custom inline CSS** with dark green theme
### Backend
- **Python 3.12** with **FastAPI**
- **SQLAlchemy ORM** with **MySQL 8.0**
- **APScheduler** for automated weekly/biweekly jobs
- **SendGrid** for transactional email
- **JWT** authentication with bcrypt password hashing
### External Services
- **Freedom Bank** — Firebase emulator simulating a real bank
- **Azure AI Foundry** — AI assistant powered by GPT-4o-mini
- **SendGrid** — Email notification delivery
---
 
## 🚀 Quick Start
 
### Prerequisites
 
| Tool | Version | Download |
|---|---|---|
| Node.js | v18+ | https://nodejs.org |
| Python | 3.12 exactly | https://python.org |
| MySQL | 8.0+ | https://dev.mysql.com/downloads |
| Git | Latest | https://git-scm.com |
| Firebase CLI | Latest | `npm install -g firebase-tools` |
 
> ⚠️ **Use Python 3.12 exactly.** Python 3.13+ has compatibility issues with some dependencies.
 
---
 
### 1️⃣ Clone the Repository
 
```bash
git clone https://github.com/MarlonCSUN/BudgetWiseAI.git
cd BudgetWiseAI
```
 
---
 
### 2️⃣ Database Setup
 
Open MySQL Workbench and run:
 
```sql
CREATE DATABASE budgetwise;
```
 
---
 
### 3️⃣ Backend Setup
 
```powershell
cd backend
copy .env.example .env
# Fill in your values (see Environment Variables section below)
 
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python create_tables.py
 
uvicorn app.main:app --reload --port 8000
```
 
✅ Backend running at: `http://localhost:8000`
 
---
 
### 4️⃣ Freedom Bank Emulator
 
```powershell
cd D:\path\to\freedom-bank-main\freedom-bank-main\functions
npm install
cd ..
firebase emulators:start
```
 
✅ Emulator UI at: `http://127.0.0.1:4000`
 
---
 
### 5️⃣ Frontend Setup
 
```powershell
cd frontend
npm install
npm start
```
 
✅ App running at: `http://localhost:3000`
 
---
 
### Running All Three Services
 
You need **three terminals** open simultaneously:
 
| Terminal | Command |
|---|---|
| Terminal 1 | `cd freedom-bank-main && firebase emulators:start` |
| Terminal 2 | `cd backend && .\venv\Scripts\Activate.ps1 && uvicorn app.main:app --reload --port 8000` |
| Terminal 3 | `cd frontend && npm start` |
 
---
 
## ⚙️ Environment Variables
 
Create `backend/.env` using `backend/.env.example` as a template:
 
```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/budgetwise
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
 
SENDGRID_API_KEY=SG.your_key_here
SENDGRID_FROM_EMAIL=your_verified_sender@email.com
SENDGRID_FROM_NAME=BudgetWise
 
AZURE_AI_ENDPOINT=https://your-resource.services.ai.azure.com/...
AZURE_AI_KEY=your_azure_key_here
AZURE_AI_DEPLOYMENT=asst_your_assistant_id
 
FIREBASE_EMULATOR=true
FREEDOM_BANK_URL=http://127.0.0.1:5001/freedom-bank-ecf5c/us-central1
```
 
> 🔐 **Never commit `.env` to version control.** Get API keys from the project owner directly.
 
---
 
## 🏦 Generating Test Transactions
 
Since Freedom Bank is a mock bank, transactions must be generated manually via PowerShell:
 
**Step 1 — Get a JWT token:**
```powershell
Invoke-WebRequest -Method POST -Uri "http://127.0.0.1:8000/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body '{"username":"YOUR_USERNAME","password":"YOUR_PASSWORD"}' `
  -UseBasicParsing
```
 
**Step 2 — Generate a transaction (run multiple times):**
```powershell
Invoke-WebRequest -Method GET -Uri "http://127.0.0.1:8000/api/v1/bank/tick" `
  -Headers @{Authorization="Bearer PASTE_TOKEN_HERE"} `
  -UseBasicParsing
```
 
Transactions appear automatically on the Activity page after syncing.
 
---
 
## 📚 API Endpoints
 
Full interactive docs at `http://localhost:8000/docs`
 
### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/signup` | Register new user | ❌ |
| POST | `/api/v1/auth/login` | Login and get JWT | ❌ |
| GET | `/api/v1/auth/me` | Get current user | ✅ |
| PUT | `/api/v1/auth/me` | Update profile | ✅ |
| PUT | `/api/v1/auth/me/password` | Change password | ✅ |
| DELETE | `/api/v1/auth/me` | Delete account | ✅ |
 
### Transactions
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/transactions/` | List transactions | ✅ |
| GET | `/api/v1/transactions/balance` | Get balance | ✅ |
| POST | `/api/v1/transactions/` | Create transaction | ✅ |
| PUT | `/api/v1/transactions/{id}` | Update transaction | ✅ |
| DELETE | `/api/v1/transactions/{id}` | Delete transaction | ✅ |
 
### Budgets, Goals, Rewards, AI, Bank, Notifications
All endpoints follow the same pattern under `/api/v1/{resource}/`. See `/docs` for full reference.
 
---
 
## 🗂️ Project Structure
 
```
BudgetWiseAI/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/     # Route handlers (auth, budgets, goals, bank, ai, notifications)
│   │   ├── core/                 # Config, security, database
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Business logic (sync, ai, notification, scheduler)
│   │   └── main.py               # App entry + scheduler startup
│   ├── create_tables.py
│   ├── requirements.txt
│   └── .env                      # Secret — never commit
│
├── frontend/
│   ├── src/
│   │   ├── components/layout/    # Sidebar, Layout, ToastContainer
│   │   ├── context/              # AuthContext, NotificationContext
│   │   ├── pages/                # Dashboard, Activity, Budgets, Goals, Rewards, Settings, AI pages
│   │   ├── services/             # API service layer
│   │   └── types/                # TypeScript interfaces
│   └── package.json
│
└── README.md
```
 
---
 
## 🔔 Notification System
 
BudgetWise supports both **in-app toast notifications** and **email notifications** for:
 
| Event | In-App | Email |
|---|---|---|
| Budget exceeded | ✅ | ✅ |
| Goal completed | ✅ | ✅ |
| Transactions synced | ✅ | ✅ |
| Goal deposit reminder | ✅ | ✅ (biweekly) |
| Weekly spending summary | ✅ | ✅ (every Sunday 9am) |
 
Each notification type can be toggled independently in **Settings → Notifications**.
 
---
 
## 🤖 AI Assistant
 
The AI assistant is powered by **Azure AI Foundry** (GPT-4o-mini) and has access to your real financial data on every message:
 
- ✅ Answer questions about your spending, budgets, and goals
- ✅ Create savings goals directly from conversation
- ✅ Create budgets from conversation
- ✅ Update and delete goals via chat
- ✅ Redirect to Spending Outlook for a full financial overview
- ✅ Persistent chat history stored in MySQL
---
 
## 🏆 Rewards System
 
- **12 badges** across 3 categories: Transactions, Budgets, Goals
- **XP-based leveling** — 100 XP per level, earned from badges
- **Animated badge cards** — spin on hover and on entry
- **Animated XP bar** with shine effect on fill
- **Per-category progress bars** with color coding
---
 
## 🔒 Security Notes
 
- Passwords are hashed with **bcrypt** — never stored in plain text
- JWTs expire after **30 days** (configurable)
- `.env` is **gitignored** — never commit secrets
- Account deletion removes **all user data** permanently
- Firebase tokens refresh automatically on bank reconnect
---

## 📄 License
 
This project was built as an educational capstone project at California State University, Northridge.
