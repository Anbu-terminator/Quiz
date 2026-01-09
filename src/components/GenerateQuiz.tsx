"use client";

import { useState } from "react";
import { generateQuiz } from "@/lib/api";
import { QuizData } from "@/lib/types";
import { QuizDisplay } from "./QuizDisplay";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Link2, AlertCircle } from "lucide-react";

export function GenerateQuiz() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!url.includes("wikipedia.org")) {
      setError("Please enter a valid Wikipedia URL");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQuiz(null);
      const data = await generateQuiz(url);
      setQuiz(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to generate quiz. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold">
          Generate Quiz from{" "}
          <span className="gradient-text">Wikipedia</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enter any Wikipedia article URL and our AI will create an interactive quiz
          to test your knowledge on the topic.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://en.wikipedia.org/wiki/Alan_Turing"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10 h-12 bg-secondary/30 border-border focus:border-primary"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !url.trim()}
            className="h-12 px-8 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Quiz
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 rounded-lg bg-destructive/20 border border-destructive/30 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
          <p className="mt-6 text-muted-foreground">Scraping Wikipedia article...</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Generating quiz with AI magic
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {quiz && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
          >
            <QuizDisplay quiz={quiz} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
