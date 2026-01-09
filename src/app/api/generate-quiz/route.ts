import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

async function scrapeWikipedia(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Wikipedia blocked the request. This can happen in some server environments.");
      }
      throw new Error(`Failed to fetch Wikipedia page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    if (html.length < 500) {
      throw new Error("Received empty or too short content from Wikipedia.");
    }

    const titleMatch = html.match(/<h1[^>]*id="firstHeading"[^>]*>([^<]+)<\/h1>/i) ||
                       html.match(/<title>([^<]+) - Wikipedia<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "Unknown Title";

    const contentMatch = html.match(/<div[^>]*class="mw-parser-output"[^>]*>([\s\S]*?)<\/div>/i);
    let content = contentMatch ? contentMatch[1] : html;
    
    content = content
      .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, "")
      .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<div[^>]*class="toc"[^>]*>[\s\S]*?<\/div>/gi, "")
      .replace(/<div[^>]*class="navbox"[^>]*>[\s\S]*?<\/div>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\[\d+\]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const paragraphs = content.split(/\.\s+/).filter(p => p.length > 60);
    const summary = paragraphs.slice(0, 3).join(". ") + ".";
    const fullContent = paragraphs.slice(0, 40).join(". ");

    const sectionMatches = html.matchAll(/<span[^>]*class="mw-headline"[^>]*>([^<]+)<\/span>/gi);
    const sections: string[] = [];
    const excludeSections = ["See also", "References", "External links", "Notes", "Further reading", "Bibliography", "Citations"];
    for (const match of sectionMatches) {
      const section = match[1].trim();
      if (!excludeSections.includes(section) && sections.length < 12) {
        sections.push(section);
      }
    }

    return { title, summary, content: fullContent, sections, raw_html: html };
  } catch (error: any) {
    console.error("Scraper Error:", error);
    throw new Error(error.message || "Network error while reaching Wikipedia.");
  }
}

async function generateQuizWithAI(title: string, content: string) {
  const hfKey = process.env.HUGGINGFACE_API_KEY;

  if (!hfKey) {
    throw new Error("HUGGINGFACE_API_KEY is not configured");
  }

  const systemPrompt = `You are an educational quiz generator. You create multiple-choice quizzes from Wikipedia articles. Always respond with valid JSON only.`;

  const userPrompt = `Using this Wikipedia article about "${title}", create a quiz.

ARTICLE TEXT:
${content.slice(0, 3500)}

Generate a JSON object with this exact structure (no markdown, no extra text):
{
  "quiz": [
    {"question": "Question about the article?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option A", "difficulty": "easy", "explanation": "Why this is correct"}
  ],
  "key_entities": {"people": ["Person 1"], "organizations": ["Org 1"], "locations": ["Location 1"]},
  "related_topics": ["Related Topic 1", "Related Topic 2"]
}

Create exactly 5 multiple-choice questions based on the article content. Each question must have 4 options. Return ONLY the JSON object.`;

  try {
    console.log("Calling Hugging Face Novita API...");
    
    const response = await fetch(
      "https://router.huggingface.co/novita/v3/openai/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${hfKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Hugging Face API error:", response.status, errText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.choices || !result.choices[0]?.message?.content) {
      console.error("Unexpected API response:", JSON.stringify(result).slice(0, 300));
      throw new Error("Invalid API response structure");
    }

    let text = result.choices[0].message.content.trim();
    console.log("Raw AI response:", text.slice(0, 200));

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    try {
      const parsed = JSON.parse(text);
      if (parsed.quiz && Array.isArray(parsed.quiz) && parsed.quiz.length > 0) {
        console.log("Successfully parsed quiz with", parsed.quiz.length, "questions");
        return parsed;
      }
      throw new Error("Invalid quiz structure in response");
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Text:", text.slice(0, 200));
      throw parseError;
    }
  } catch (error: any) {
    console.error("AI generation failed:", error.message);
    console.log("Using fallback quiz generator");
    return generateFallbackQuiz(title, content);
  }
}

function generateFallbackQuiz(title: string, content: string) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 40);
  const quiz = [];
  
  const people: string[] = [];
  const organizations: string[] = [];
  const locations: string[] = [];

  for (let i = 0; i < Math.min(5, Math.max(3, sentences.length)); i++) {
    const sentence = sentences[i]?.trim() || `Information about ${title}`;
    
    quiz.push({
      question: `Based on the article about "${title}", which statement is accurate?`,
      options: [
        sentence.length > 60 ? sentence.slice(0, 60) + "..." : sentence,
        "This topic is unrelated to the article",
        "The article does not discuss this subject",
        "None of the provided options"
      ],
      answer: sentence.length > 60 ? sentence.slice(0, 60) + "..." : sentence,
      difficulty: i < 2 ? "easy" : i < 4 ? "medium" : "hard",
      explanation: `This information comes directly from the Wikipedia article about ${title}.`
    });
  }

  while (quiz.length < 3) {
    quiz.push({
      question: `What is the main subject of this Wikipedia article?`,
      options: [title, "Unrelated Topic A", "Unrelated Topic B", "Unrelated Topic C"],
      answer: title,
      difficulty: "easy",
      explanation: `The article is primarily about ${title}.`
    });
  }

  return {
    quiz,
    key_entities: { people, organizations, locations },
    related_topics: [`More about ${title}`, "Related Wikipedia articles", "Further reading"]
  };
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes("wikipedia.org")) {
      return NextResponse.json({ error: "Invalid URL: Must be a Wikipedia URL" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("wiki_quizzes")
      .select("*")
      .eq("url", url)
      .single();

    if (existing) {
      return NextResponse.json({
        id: existing.id,
        url: existing.url,
        title: existing.title,
        summary: existing.summary,
        key_entities: existing.key_entities,
        sections: existing.sections,
        quiz: existing.quiz,
        related_topics: existing.related_topics,
        created_at: existing.created_at,
      });
    }

    const scraped = await scrapeWikipedia(url);
    const aiResults = await generateQuizWithAI(scraped.title, scraped.content);

    const { data: newQuiz, error } = await supabase
      .from("wiki_quizzes")
      .insert({
        url,
        title: scraped.title,
        summary: scraped.summary,
        key_entities: aiResults.key_entities,
        sections: scraped.sections,
        quiz: aiResults.quiz,
        related_topics: aiResults.related_topics,
        raw_html: scraped.raw_html,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 });
    }

    return NextResponse.json({
      id: newQuiz.id,
      url: newQuiz.url,
      title: newQuiz.title,
      summary: newQuiz.summary,
      key_entities: newQuiz.key_entities,
      sections: newQuiz.sections,
      quiz: newQuiz.quiz,
      related_topics: newQuiz.related_topics,
      created_at: newQuiz.created_at,
    });
  } catch (error) {
    console.error("Generate quiz error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
