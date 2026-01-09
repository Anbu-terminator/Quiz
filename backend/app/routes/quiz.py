from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import WikiQuiz
from app.schemas import QuizGenerateRequest, QuizResponse, QuizHistoryItem, QuizHistoryResponse, KeyEntities
from app.services.wikipedia_scraper import WikipediaScraper
from app.services.quiz_generator import QuizGenerator

router = APIRouter()

scraper = WikipediaScraper()
quiz_gen = QuizGenerator()

@router.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizGenerateRequest, db: Session = Depends(get_db)):
    url = request.url.strip()
    
    if not scraper.validate_url(url):
        raise HTTPException(status_code=400, detail="Invalid URL: Must be a Wikipedia URL")
    
    existing = db.query(WikiQuiz).filter(WikiQuiz.url == url).first()
    if existing:
        return QuizResponse(
            id=existing.id,
            url=existing.url,
            title=existing.title,
            summary=existing.summary or "",
            key_entities=KeyEntities(**existing.key_entities),
            sections=existing.sections,
            quiz=existing.quiz,
            related_topics=existing.related_topics,
            created_at=existing.created_at
        )
    
    try:
        scraped_data = scraper.scrape(url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scrape Wikipedia: {str(e)}")
    
    try:
        ai_results = quiz_gen.generate_all(scraped_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")
    
    wiki_quiz = WikiQuiz(
        url=url,
        title=scraped_data["title"],
        summary=scraped_data["summary"],
        key_entities=ai_results["key_entities"],
        sections=scraped_data["sections"],
        quiz=ai_results["quiz"],
        related_topics=ai_results["related_topics"],
        raw_html=scraped_data["raw_html"]
    )
    
    db.add(wiki_quiz)
    db.commit()
    db.refresh(wiki_quiz)
    
    return QuizResponse(
        id=wiki_quiz.id,
        url=wiki_quiz.url,
        title=wiki_quiz.title,
        summary=wiki_quiz.summary or "",
        key_entities=KeyEntities(**wiki_quiz.key_entities),
        sections=wiki_quiz.sections,
        quiz=wiki_quiz.quiz,
        related_topics=wiki_quiz.related_topics,
        created_at=wiki_quiz.created_at
    )

@router.get("/history", response_model=QuizHistoryResponse)
async def get_history(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    total = db.query(WikiQuiz).count()
    quizzes = db.query(WikiQuiz).order_by(WikiQuiz.created_at.desc()).offset(skip).limit(limit).all()
    
    return QuizHistoryResponse(
        quizzes=[
            QuizHistoryItem(
                id=q.id,
                url=q.url,
                title=q.title,
                created_at=q.created_at
            )
            for q in quizzes
        ],
        total=total
    )

@router.get("/quiz/{quiz_id}", response_model=QuizResponse)
async def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(WikiQuiz).filter(WikiQuiz.id == quiz_id).first()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    return QuizResponse(
        id=quiz.id,
        url=quiz.url,
        title=quiz.title,
        summary=quiz.summary or "",
        key_entities=KeyEntities(**quiz.key_entities),
        sections=quiz.sections,
        quiz=quiz.quiz,
        related_topics=quiz.related_topics,
        created_at=quiz.created_at
    )
