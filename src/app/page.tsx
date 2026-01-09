"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateQuiz } from "@/components/GenerateQuiz";
import { QuizHistory } from "@/components/QuizHistory";
import { motion } from "framer-motion";
import { Brain, Sparkles, History } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen mesh-gradient">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-chart-3/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              <span className="gradient-text">DeepKlarity</span>
              <span className="text-foreground"> Technologies</span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-Powered Wiki Quiz Generator
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            Transform Wikipedia articles into interactive quizzes using Hugging Face AI
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="generate" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="h-12 p-1 bg-secondary/50 backdrop-blur-sm border border-border">
                <TabsTrigger
                  value="generate"
                  className="h-10 px-6 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Quiz
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="h-10 px-6 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <History className="w-4 h-4" />
                  Past Quizzes
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="generate" className="mt-0">
              <GenerateQuiz />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <QuizHistory />
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center text-sm text-muted-foreground/60"
        >
          <p>
            Powered by{" "}
            <span className="text-primary font-medium">Hugging Face AI</span>
            {" "}&{" "}
            <span className="text-chart-2 font-medium">LangChain</span>
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
