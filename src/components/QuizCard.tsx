"use client";

import { QuizQuestion } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, X, Eye, EyeOff, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  quizMode?: boolean;
  onAnswer?: (isCorrect: boolean) => void;
}

export function QuizCard({ question, index, quizMode = false, onAnswer }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(!quizMode);
  const [answered, setAnswered] = useState(false);

  const difficultyColors = {
    easy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    hard: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  };

  const handleOptionClick = (option: string) => {
    if (!quizMode || answered) return;
    setSelectedOption(option);
    setAnswered(true);
    setShowAnswer(true);
    const isCorrect = option === question.answer;
    onAnswer?.(isCorrect);
  };

  const resetQuestion = () => {
    setSelectedOption(null);
    setAnswered(false);
    setShowAnswer(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="glass-card hover:border-primary/30 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                {index + 1}
              </span>
              <CardTitle className="text-lg font-semibold leading-tight">
                {question.question}
              </CardTitle>
            </div>
            <Badge className={`${difficultyColors[question.difficulty]} border shrink-0`}>
              {question.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            {question.options.map((option, optIndex) => {
              const isCorrect = option === question.answer;
              const isSelected = option === selectedOption;
              let optionClass = "p-3 rounded-lg border transition-all duration-200 cursor-pointer ";

              if (showAnswer) {
                if (isCorrect) {
                  optionClass += "bg-emerald-500/20 border-emerald-500/50 text-emerald-300";
                } else if (isSelected && !isCorrect) {
                  optionClass += "bg-rose-500/20 border-rose-500/50 text-rose-300";
                } else {
                  optionClass += "bg-secondary/30 border-border/50 text-muted-foreground";
                }
              } else {
                optionClass += isSelected
                  ? "bg-primary/20 border-primary/50"
                  : "bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-primary/30";
              }

              return (
                <div
                  key={optIndex}
                  className={optionClass}
                  onClick={() => handleOptionClick(option)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-background/50 flex items-center justify-center text-xs font-medium">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span>{option}</span>
                    </div>
                    {showAnswer && (
                      <span>
                        {isCorrect ? (
                          <Check className="w-5 h-5 text-emerald-400" />
                        ) : isSelected ? (
                          <X className="w-5 h-5 text-rose-400" />
                        ) : null}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">Explanation:</span>{" "}
                    {question.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {quizMode && (
            <div className="flex items-center gap-2 pt-2">
              {!showAnswer && !answered ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnswer(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Reveal Answer
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetQuestion}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
