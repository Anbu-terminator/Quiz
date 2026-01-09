# DeepKlarity Technologies – Wiki Quiz Generator

DeepKlarity Wiki Quiz Generator is a full-stack web application that converts Wikipedia articles into structured, interactive quizzes.  
It extracts meaningful content from articles, analyzes key concepts, and presents them as multiple-choice questions through a modern, responsive interface.

The system is designed for **learning, assessment, and knowledge reinforcement**, making it suitable for students, educators, and self-learners.

---

## 🚀 Overview

- Enter any Wikipedia article URL  
- Automatically extract structured content  
- Generate quizzes based strictly on article facts  
- Play quizzes interactively with scoring  
- View and revisit past quizzes with full details  

---

## 🧠 Core Capabilities

- Wikipedia content extraction and parsing
- Section-wise content understanding
- Entity identification (people, organizations, locations)
- Multiple-choice quiz generation with difficulty levels
- Interactive quiz mode with scoring
- Quiz history with detailed modal view
- Duplicate URL caching for performance
- Dark-mode friendly, responsive UI

---

## 🛠️ Tech Stack

### Backend (Python)
- **FastAPI** – High-performance API framework  
- **SQLAlchemy** – ORM for database operations  
- **PostgreSQL (Supabase)** – Persistent storage  
- **BeautifulSoup4** – HTML parsing and scraping  
- **LangChain** – Content orchestration layer  
- **Google Gemini** – Quiz and content generation  

### Frontend (Next.js)
- **Next.js 15 (App Router)** – Modern React framework  
- **TypeScript** – Type-safe frontend development  
- **Tailwind CSS** – Utility-first styling  
- **Shadcn/UI** – Accessible UI components  
- **Framer Motion** – Smooth animations  

---

/backend
/app
main.py # FastAPI entry point
database.py # Database connection
models.py # ORM models
schemas.py # API schemas
/services
wikipedia_scraper.py
quiz_generator.py
/routes
quiz.py
requirements.txt

/src
/app
page.tsx
layout.tsx
globals.css
/components
GenerateQuiz.tsx
QuizHistory.tsx
QuizDisplay.tsx
QuizCard.tsx
/lib
api.ts
types.ts

/sample_data
urls.txt
sample_outputs.json


---

## 🔗 API Endpoints

### Generate Quiz
**POST** `/api/generate-quiz`

**Request**
```json
{
  "url": "https://en.wikipedia.org/wiki/Alan_Turing"
}

Response

{
  "id": 1,
  "title": "Alan Turing",
  "summary": "...",
  "key_entities": {
    "people": [],
    "organizations": [],
    "locations": []
  },
  "sections": [],
  "quiz": [],
  "related_topics": [],
  "created_at": "2024-01-01T00:00:00Z"
}

Quiz History

GET /api/history
Returns all previously generated quizzes.

Quiz Details

GET /api/quiz/{id}
Returns full quiz data for a specific quiz.

🗄️ Database Schema

CREATE TABLE wiki_quizzes (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    key_entities JSONB DEFAULT '{}',
    sections JSONB DEFAULT '[]',
    quiz JSONB DEFAULT '[]',
    related_topics JSONB DEFAULT '[]',
    raw_html TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
⚙️ Setup Instructions
Prerequisites

Python 3.10+

Node.js 18+

PostgreSQL (Supabase recommended)

Environment Variables

Create a .env file:
DATABASE_URL=postgresql://username:password@host:port/dbname
GEMINI_API_KEY=your_api_key
NEXT_PUBLIC_API_URL=http://localhost:8000

Backend Setup

cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

Frontend Setup

npm install
npm run dev

▶️ Running the Application

Start the backend server on port 8000

Start the frontend on port 3000

Open your browser at
👉 http://localhost:3000

✨ Additional Highlights

Intelligent caching prevents duplicate scraping

Raw HTML is preserved for traceability

Difficulty-based question categorization

Clean UI with animations and dark theme

Modular, scalable architecture

📌 Use Cases

Educational platforms

Student self-assessment

Knowledge validation tools

Interview preparation

Research-based learning

📄 License

This project is licensed under the MIT License.
Feel free to use, modify, and distribute.


If you want, I can also:
- Add **badges** (Vercel, License, Tech stack)
- Write a **Vercel deployment section**
- Convert this into a **professional PDF**
- Optimize it for **GitHub trending visibility**

Just say the word 🚀







## 📁 Project Structure

