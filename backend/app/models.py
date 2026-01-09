from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class WikiQuiz(Base):
    __tablename__ = "wiki_quizzes"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(Text, unique=True, nullable=False, index=True)
    title = Column(Text, nullable=False)
    summary = Column(Text)
    key_entities = Column(JSON, default={})
    sections = Column(JSON, default=[])
    quiz = Column(JSON, default=[])
    related_topics = Column(JSON, default=[])
    raw_html = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
