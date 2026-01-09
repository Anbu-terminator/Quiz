# DeepKlarity Technologies - AI Wiki Quiz Generator

An AI-powered quiz generator that creates interactive quizzes from Wikipedia articles using Google Gemini AI and LangChain.

## Tech Stack

### Backend (Python)
- **FastAPI** - Modern, high-performance web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Database (via Supabase)
- **BeautifulSoup4** - HTML parsing and web scraping
- **LangChain** - LLM orchestration framework
- **Google Gemini** - AI model for quiz generation

### Frontend (Next.js)
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Component library
- **Framer Motion** - Animation library

## Features

- Generate AI-powered quizzes from any Wikipedia article
- Extract key entities (people, organizations, locations)
- Identify article sections and related topics
- Interactive quiz mode with scoring
- Quiz history with full details modal
- Caching to prevent duplicate scraping
- Beautiful, responsive UI with dark theme

## Project Structure

```
/backend
  /app
    main.py           # FastAPI application entry
    database.py       # Database configuration
    models.py         # SQLAlchemy models
    schemas.py        # Pydantic schemas
    /services
      wikipedia_scraper.py  # Web scraping service
      quiz_generator.py     # LangChain + Gemini integration
    /routes
      quiz.py         # API endpoints
  requirements.txt    # Python dependencies

/src (Frontend)
  /app
    page.tsx          # Main page with tabs
    layout.tsx        # Root layout
    globals.css       # Global styles
  /components
    GenerateQuiz.tsx  # Quiz generation form
    QuizHistory.tsx   # History table with modal
    QuizDisplay.tsx   # Quiz result display
    QuizCard.tsx      # Individual question card
  /lib
    api.ts           # API client functions
    types.ts         # TypeScript interfaces

/sample_data
  urls.txt           # Sample Wikipedia URLs
  sample_outputs.json # Example API response
```

## API Endpoints

### POST /api/generate-quiz
Generate a quiz from a Wikipedia URL.

**Request:**
```json
{
  "url": "https://en.wikipedia.org/wiki/Alan_Turing"
}
```

**Response:**
```json
{
  "id": 1,
  "url": "https://en.wikipedia.org/wiki/Alan_Turing",
  "title": "Alan Turing",
  "summary": "...",
  "key_entities": {
    "people": ["Alan Turing", "Alonzo Church"],
    "organizations": ["University of Cambridge"],
    "locations": ["United Kingdom"]
  },
  "sections": ["Early life", "Education", ...],
  "quiz": [
    {
      "question": "Where did Alan Turing study?",
      "options": ["Harvard", "Cambridge", "Oxford", "Princeton"],
      "answer": "Cambridge",
      "difficulty": "easy",
      "explanation": "Mentioned in the Education section."
    }
  ],
  "related_topics": ["Cryptography", "Computer science"],
  "created_at": "2024-01-01T00:00:00Z"
}
```

### GET /api/history
Get list of previously generated quizzes.

### GET /api/quiz/{id}
Get full quiz details by ID.

## Database Schema

```sql
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
```

## LangChain Prompt Templates

### Quiz Generation Prompt
```
You are an educational content generator specializing in creating factual quiz questions.

Using ONLY the provided Wikipedia article text below, generate 7 multiple-choice quiz questions.

ARTICLE TITLE: {title}
ARTICLE CONTENT: {content}

RULES:
1. Questions must be STRICTLY grounded in the article text - no hallucinations
2. Each question must have exactly 4 options (A, B, C, D)
3. Only ONE option should be correct
4. Include a brief explanation referencing the article content
5. Assign difficulty: "easy", "medium", or "hard"
6. Cover different aspects/sections of the article
7. Make incorrect options plausible but clearly wrong based on the text

Return output strictly in JSON format.
```

### Entity Extraction Prompt
```
Extract key entities from this Wikipedia article.

ARTICLE TITLE: {title}
ARTICLE CONTENT: {content}

Extract and categorize entities into:
1. people - names of individuals mentioned
2. organizations - companies, institutions, groups
3. locations - places, countries, cities

Return as JSON with keys: people, organizations, locations
```

### Related Topics Prompt
```
Based on this Wikipedia article, suggest related topics for further reading.

ARTICLE TITLE: {title}
ARTICLE SUMMARY: {summary}
ARTICLE SECTIONS: {sections}

Suggest 5-7 related Wikipedia topics that would help someone learn more about this subject.
```

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database (Supabase recommended)

### Environment Variables
Create a `.env` file:
```
DATABASE_URL=postgresql://...
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
npm install
npm run dev
```

### Database Setup
The database schema is automatically created. For manual setup:
```sql
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
```

## Running Locally

1. Start the backend:
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

2. Start the frontend:
```bash
npm run dev
```

3. Open http://localhost:3000

## Bonus Features Implemented

- URL caching (duplicate URLs return cached results)
- Raw HTML storage
- Interactive quiz mode with scoring
- Section-wise article breakdown
- Entity extraction and categorization
- Related topic suggestions

## Screenshots

[Screenshots would be placed here showing:]
- Generate Quiz tab with URL input
- Generated quiz with questions and answers
- Quiz mode with scoring
- History tab with past quizzes
- Quiz details modal
