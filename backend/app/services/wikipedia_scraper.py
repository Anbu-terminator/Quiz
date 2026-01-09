import re
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
from urllib.parse import urlparse

class WikipediaScraper:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }

    def validate_url(self, url: str) -> bool:
        parsed = urlparse(url)
        return "wikipedia.org" in parsed.netloc

    def scrape(self, url: str) -> Dict:
        if not self.validate_url(url):
            raise ValueError("Invalid URL: Must be a Wikipedia URL")

        response = requests.get(url, headers=self.headers, timeout=30)
        response.raise_for_status()
        
        raw_html = response.text
        soup = BeautifulSoup(raw_html, "html.parser")
        
        title = self._extract_title(soup)
        summary = self._extract_summary(soup)
        sections = self._extract_sections(soup)
        content = self._extract_content(soup)

        return {
            "title": title,
            "summary": summary,
            "sections": sections,
            "content": content,
            "raw_html": raw_html
        }

    def _extract_title(self, soup: BeautifulSoup) -> str:
        title_elem = soup.find("h1", {"id": "firstHeading"})
        if title_elem:
            return title_elem.get_text(strip=True)
        title_elem = soup.find("title")
        if title_elem:
            return title_elem.get_text(strip=True).replace(" - Wikipedia", "")
        return "Unknown Title"

    def _extract_summary(self, soup: BeautifulSoup) -> str:
        content_div = soup.find("div", {"id": "mw-content-text"})
        if not content_div:
            return ""
        
        paragraphs = []
        for p in content_div.find_all("p", recursive=True):
            if p.find_parent(class_=["infobox", "sidebar", "navbox"]):
                continue
            text = p.get_text(strip=True)
            if text and len(text) > 50:
                paragraphs.append(text)
                if len(paragraphs) >= 3:
                    break
        
        return " ".join(paragraphs)

    def _extract_sections(self, soup: BeautifulSoup) -> List[str]:
        sections = []
        for heading in soup.find_all(["h2", "h3"]):
            span = heading.find("span", class_="mw-headline")
            if span:
                section_title = span.get_text(strip=True)
                if section_title not in ["See also", "References", "External links", "Notes", "Further reading", "Bibliography"]:
                    sections.append(section_title)
        return sections[:15]

    def _extract_content(self, soup: BeautifulSoup) -> str:
        content_div = soup.find("div", {"id": "mw-content-text"})
        if not content_div:
            return ""
        
        for element in content_div.find_all(["table", "sup", "style", "script"]):
            element.decompose()
        
        for element in content_div.find_all(class_=["infobox", "sidebar", "navbox", "reference", "reflist"]):
            element.decompose()
        
        paragraphs = []
        for p in content_div.find_all("p"):
            text = p.get_text(strip=True)
            if text and len(text) > 30:
                text = re.sub(r"\[\d+\]", "", text)
                text = re.sub(r"\s+", " ", text)
                paragraphs.append(text)
        
        return "\n\n".join(paragraphs[:50])
