import os
import json
import re
from typing import Dict, List
from langchain_community.llms import HuggingFaceHub
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv

load_dotenv()

QUIZ_GENERATION_TEMPLATE = """You are an educational content generator specializing in creating factual quiz questions.

Using ONLY the provided Wikipedia article text below, generate 7 multiple-choice quiz questions.

ARTICLE TITLE: {title}

ARTICLE CONTENT:
{content}

RULES:
1. Questions must be STRICTLY grounded in the article text - no hallucinations
2. Each question must have exactly 4 options (A, B, C, D)
3. Only ONE option should be correct
4. Include a brief explanation referencing the article content
5. Assign difficulty: "easy", "medium", or "hard"
6. Cover different aspects/sections of the article
7. Make incorrect options plausible but clearly wrong based on the text

Return your response as a valid JSON array with this exact structure:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "The correct option text (must match one of the options exactly)",
    "difficulty": "easy|medium|hard",
    "explanation": "Brief explanation referencing the article"
  }}
]

Generate exactly 7 questions. Return ONLY the JSON array, no additional text."""

ENTITY_EXTRACTION_TEMPLATE = """Extract key entities from this Wikipedia article.

ARTICLE TITLE: {title}

ARTICLE CONTENT:
{content}

Extract and categorize entities into:
1. people - names of individuals mentioned
2. organizations - companies, institutions, groups
3. locations - places, countries, cities

Return as a valid JSON object:
{{
  "people": ["name1", "name2"],
  "organizations": ["org1", "org2"],
  "locations": ["place1", "place2"]
}}

Include only entities that are clearly mentioned in the text. Limit to 5-8 items per category.
Return ONLY the JSON object, no additional text."""

RELATED_TOPICS_TEMPLATE = """Based on this Wikipedia article, suggest related topics for further reading.

ARTICLE TITLE: {title}

ARTICLE SUMMARY:
{summary}

ARTICLE SECTIONS:
{sections}

Suggest 5-7 related Wikipedia topics that would help someone learn more about this subject.
Topics should be directly related to the main subject matter.

Return as a JSON array of strings:
["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]

Return ONLY the JSON array, no additional text."""


class QuizGenerator:
    def __init__(self):
        api_key = os.getenv("HUGGINGFACE_API_KEY")
        model_id = os.getenv("HUGGINGFACE_MODEL", "mistralai/Mistral-7B-Instruct-v0.2")
        if not api_key:
            raise ValueError("HUGGINGFACE_API_KEY not found in environment variables")
        
        self.llm = HuggingFaceHub(
            repo_id=model_id,
            huggingfacehub_api_token=api_key,
            model_kwargs={"temperature": 0.3, "max_new_tokens": 1000}
        )
        
        self.quiz_prompt = PromptTemplate(
            input_variables=["title", "content"],
            template=QUIZ_GENERATION_TEMPLATE
        )
        
        self.entity_prompt = PromptTemplate(
            input_variables=["title", "content"],
            template=ENTITY_EXTRACTION_TEMPLATE
        )
        
        self.topics_prompt = PromptTemplate(
            input_variables=["title", "summary", "sections"],
            template=RELATED_TOPICS_TEMPLATE
        )

    def _extract_json(self, text: str) -> str:
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    def generate_quiz(self, title: str, content: str) -> List[Dict]:
        try:
            chain = LLMChain(llm=self.llm, prompt=self.quiz_prompt)
            result = chain.run(title=title, content=content[:15000])
            
            json_str = self._extract_json(result)
            quiz = json.loads(json_str)
            
            validated_quiz = []
            for q in quiz:
                if all(k in q for k in ["question", "options", "answer", "difficulty", "explanation"]):
                    if len(q["options"]) == 4:
                        validated_quiz.append(q)
            
            return validated_quiz[:10]
        except Exception as e:
            print(f"Quiz generation error: {e}")
            return []

    def extract_entities(self, title: str, content: str) -> Dict:
        try:
            chain = LLMChain(llm=self.llm, prompt=self.entity_prompt)
            result = chain.run(title=title, content=content[:10000])
            
            json_str = self._extract_json(result)
            entities = json.loads(json_str)
            
            return {
                "people": entities.get("people", [])[:8],
                "organizations": entities.get("organizations", [])[:8],
                "locations": entities.get("locations", [])[:8]
            }
        except Exception as e:
            print(f"Entity extraction error: {e}")
            return {"people": [], "organizations": [], "locations": []}

    def generate_related_topics(self, title: str, summary: str, sections: List[str]) -> List[str]:
        try:
            chain = LLMChain(llm=self.llm, prompt=self.topics_prompt)
            result = chain.run(
                title=title, 
                summary=summary[:2000],
                sections=", ".join(sections)
            )
            
            json_str = self._extract_json(result)
            topics = json.loads(json_str)
            
            return topics[:7] if isinstance(topics, list) else []
        except Exception as e:
            print(f"Related topics error: {e}")
            return []

    def generate_all(self, scraped_data: Dict) -> Dict:
        title = scraped_data["title"]
        content = scraped_data["content"]
        summary = scraped_data["summary"]
        sections = scraped_data["sections"]
        
        quiz = self.generate_quiz(title, content)
        entities = self.extract_entities(title, content)
        related_topics = self.generate_related_topics(title, summary, sections)
        
        return {
            "quiz": quiz,
            "key_entities": entities,
            "related_topics": related_topics
        }
