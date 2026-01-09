"use client";

import { useState, useEffect } from "react";
import { QuizHistoryItem, QuizData } from "@/lib/types";
import { getQuizHistory, getQuizById } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { QuizDisplay } from "./QuizDisplay";
import { motion } from "framer-motion";
import { History, ExternalLink, Eye, Loader2, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function QuizHistory() {
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizData | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuizHistory();
      setHistory(data.quizzes);
    } catch (err) {
      setError("Failed to load quiz history. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewDetails = async (id: number) => {
    try {
      setLoadingQuiz(true);
      const quiz = await getQuizById(id);
      setSelectedQuiz(quiz);
      setDialogOpen(true);
    } catch (err) {
      setError("Failed to load quiz details");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading quiz history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
          <History className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchHistory} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-float">
          <History className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Quizzes Yet</h3>
        <p className="text-muted-foreground max-w-md">
          Generate your first quiz by entering a Wikipedia URL in the Generate Quiz tab.
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Quiz History
            <span className="text-muted-foreground font-normal text-lg">({history.length})</span>
          </h2>
          <Button onClick={fetchHistory} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden glass-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">URL</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-border hover:bg-secondary/30"
                >
                  <TableCell className="font-mono text-muted-foreground">
                    #{item.id}
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 max-w-xs truncate"
                    >
                      {item.url.replace("https://en.wikipedia.org/wiki/", "")}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewDetails(item.id)}
                      disabled={loadingQuiz}
                    >
                      {loadingQuiz ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </>
                      )}
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto glass-card">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">Quiz Details</DialogTitle>
          </DialogHeader>
          {selectedQuiz && <QuizDisplay quiz={selectedQuiz} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
