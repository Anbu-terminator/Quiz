import { QuizData, QuizHistoryResponse } from "./types";

export async function generateQuiz(url: string): Promise<QuizData> {
  const response = await fetch("/api/generate-quiz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate quiz");
  }

  return response.json();
}

export async function getQuizHistory(): Promise<QuizHistoryResponse> {
  const response = await fetch("/api/history");

  if (!response.ok) {
    throw new Error("Failed to fetch quiz history");
  }

  return response.json();
}

export async function getQuizById(id: number): Promise<QuizData> {
  const response = await fetch(`/api/quiz/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch quiz");
  }

  return response.json();
}
