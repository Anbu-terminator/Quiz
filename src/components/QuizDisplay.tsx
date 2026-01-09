"use client";

import { QuizData } from "@/lib/types";
import { QuizCard } from "./QuizCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Building2, 
  MapPin, 
  BookOpen, 
  Sparkles, 
  ExternalLink,
  Trophy,
  Target,
  RotateCcw
} from "lucide-react";

interface QuizDisplayProps {
  quiz: QuizData;
}

export function QuizDisplay({ quiz }: QuizDisplayProps) {
  const [quizMode, setQuizMode] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setScore((s) => s + 1);
    setAnswered((a) => a + 1);
  };

  const resetQuiz = () => {
    setScore(0);
    setAnswered(0);
    setQuizMode(false);
  };

  const scorePercentage = answered > 0 ? Math.round((score / answered) * 100) : 0;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold gradient-text">{quiz.title}</h2>
            <a
              href={quiz.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
            >
              {quiz.url}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            {quizMode ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="font-semibold">
                    {score}/{answered}
                  </span>
                  <span className="text-muted-foreground">({scorePercentage}%)</span>
                </div>
                <Button variant="outline" onClick={resetQuiz}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </>
            ) : (
              <Button onClick={() => setQuizMode(true)} className="gap-2">
                <Target className="w-4 h-4" />
                Take Quiz
              </Button>
            )}
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">{quiz.summary}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-chart-1" />
                People
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {quiz.key_entities.people.length > 0 ? (
                  quiz.key_entities.people.map((person, i) => (
                    <Badge key={i} variant="secondary" className="bg-chart-1/20 text-chart-1 border-chart-1/30">
                      {person}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No people found</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-chart-2" />
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {quiz.key_entities.organizations.length > 0 ? (
                  quiz.key_entities.organizations.map((org, i) => (
                    <Badge key={i} variant="secondary" className="bg-chart-2/20 text-chart-2 border-chart-2/30">
                      {org}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No organizations found</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-chart-4" />
                Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {quiz.key_entities.locations.length > 0 ? (
                  quiz.key_entities.locations.map((loc, i) => (
                    <Badge key={i} variant="secondary" className="bg-chart-4/20 text-chart-4 border-chart-4/30">
                      {loc}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No locations found</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-chart-5" />
                Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {quiz.sections.map((section, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-chart-5" />
                    {section}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-3"
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-chart-3" />
                Related Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {quiz.related_topics.map((topic, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-chart-3/10 text-chart-3 border-chart-3/30 hover:bg-chart-3/20 cursor-pointer transition-colors"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">
            Quiz Questions
            <span className="text-muted-foreground font-normal ml-2">({quiz.quiz.length})</span>
          </h3>
          {quizMode && answered === quiz.quiz.length && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30"
            >
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                Final Score: {score}/{quiz.quiz.length} ({scorePercentage}%)
              </span>
            </motion.div>
          )}
        </div>

        <div className="grid gap-4">
          {quiz.quiz.map((question, index) => (
            <QuizCard
              key={index}
              question={question}
              index={index}
              quizMode={quizMode}
              onAnswer={handleAnswer}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
