import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quizId = parseInt(id, 10);

    if (isNaN(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("wiki_quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      url: data.url,
      title: data.title,
      summary: data.summary,
      key_entities: data.key_entities,
      sections: data.sections,
      quiz: data.quiz,
      related_topics: data.related_topics,
      created_at: data.created_at,
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}
