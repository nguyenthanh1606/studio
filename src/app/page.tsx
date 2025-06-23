"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FC } from 'react';
import { ArrowLeft, ArrowRight, BrainCircuit, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { getFlashcards, getSuggestedTopic } from '@/app/actions';
import type { Flashcard as FlashcardType } from '@/lib/types';
import { generateQuizOptions } from '@/lib/quiz-helpers';
import { useToast } from "@/hooks/use-toast";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from "@/components/ui/progress";
import { Flashcard } from '@/components/flashcard';
import { QuizCard } from '@/components/quiz-card';
import { FlashcardSkeleton } from '@/components/flashcard-skeleton';

type QuizState = {
  options: Record<string, string[]>;
  answers: Record<string, string | null>;
  results: Record<string, boolean | null>;
  score: number;
};

const TopicForm: FC<{ onGenerate: (topic: string) => void; isLoading: boolean }> = ({ onGenerate, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (topic) {
      onGenerate(topic);
    }
  };

  const handleSuggestTopic = async () => {
    setIsSuggesting(true);
    try {
      const result = await getSuggestedTopic();
      if ('error' in result) {
        throw new Error(result.error);
      }
      setTopic(result.topic);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      toast({
        variant: "destructive",
        title: "Error Suggesting Topic",
        description: errorMessage,
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3">
      <div className="flex w-full items-center space-x-2">
        <Input
          name="topic"
          type="text"
          placeholder="e.g. 'Common kitchen items'"
          className="text-base"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isLoading || isSuggesting}
          required
        />
        <Button type="submit" disabled={isLoading || isSuggesting || !topic.trim()}>
          {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Generate
        </Button>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleSuggestTopic}
        disabled={isLoading || isSuggesting}
      >
        {isSuggesting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Suggest a topic for me
      </Button>
    </form>
  );
};


export default function Home() {
  const [topic, setTopic] = useState<string>('');
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [mode, setMode] = useState<'study' | 'quiz'>('study');

  const [quizState, setQuizState] = useState<QuizState>({
    options: {},
    answers: {},
    results: {},
    score: 0,
  });

  const handleGenerate = async (newTopic: string) => {
    setIsLoading(true);
    setTopic(newTopic);
    setFlashcards([]);
    setCurrentIndex(0);
    setQuizState({ options: {}, answers: {}, results: {}, score: 0 });
    setError(null);

    try {
      const result = await getFlashcards(newTopic);
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      const newFlashcards = result.map((card, index) => ({ ...card, id: `${newTopic}-${index}` }));
      setFlashcards(newFlashcards);

      const newOptions: Record<string, string[]> = {};
      newFlashcards.forEach(card => {
        newOptions[card.id] = generateQuizOptions(card, newFlashcards);
      });
      setQuizState(prevState => ({ ...prevState, options: newOptions }));

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error Generating Flashcards",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const currentCard = useMemo(() => flashcards[currentIndex], [flashcards, currentIndex]);
  
  const handleNext = useCallback(() => {
    const canGoNext = currentIndex < flashcards.length - 1;
    if (!canGoNext) return;
    
    if (mode === 'quiz' && currentCard && !quizState.answers[currentCard.id]) {
      return;
    }

    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, flashcards.length, mode, currentCard, quizState.answers]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev]);
  
  const handleQuizAnswer = (cardId: string, answer: string, correctAnswer: string) => {
    const isCorrect = answer === correctAnswer;
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [cardId]: answer },
      results: { ...prev.results, [cardId]: isCorrect },
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setQuizState(prev => ({ ...prev, answers: {}, results: {}, score: 0 }));
  };

  const isQuizFinished = useMemo(() => Object.keys(quizState.answers).length === flashcards.length, [quizState.answers, flashcards.length]);
  
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="flex w-full max-w-2xl flex-col items-center space-y-8">
        <header className="flex flex-col items-center space-y-2 text-center">
            <div className="flex items-center gap-2">
                <BrainCircuit className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    LinguaFlash
                </h1>
            </div>
          <p className="max-w-xl text-muted-foreground">
            AI-powered flashcards to accelerate your Vietnamese language acquisition.
          </p>
        </header>

        <section className="w-full">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col items-start space-y-4">
                        <h2 className="text-lg font-semibold">Enter a topic to start learning</h2>
                        <TopicForm onGenerate={handleGenerate} isLoading={isLoading} />
                    </div>
                </CardContent>
            </Card>
        </section>

        {isLoading && <FlashcardSkeleton />}

        {flashcards.length > 0 && !isLoading && (
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'study' | 'quiz')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="study">Study</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="study" className="relative min-h-[350px]">
                  <Flashcard 
                    word={currentCard.word} 
                    meaning={currentCard.meaning} 
                    example={currentCard.example} 
                  />
                </TabsContent>
                <TabsContent value="quiz" className="relative min-h-[350px]">
                  {!isQuizFinished ? (
                     <QuizCard
                        card={currentCard}
                        options={quizState.options[currentCard.id] || []}
                        onSelectAnswer={(answer) => handleQuizAnswer(currentCard.id, answer, currentCard.meaning)}
                        selectedAnswer={quizState.answers[currentCard.id]}
                        isCorrect={quizState.results[currentCard.id]}
                     />
                  ) : (
                    <div className="flex h-[350px] flex-col items-center justify-center rounded-xl border-2 border-dashed bg-card p-8 text-center">
                      <h2 className="text-2xl font-bold">Quiz Complete!</h2>
                      <p className="mt-2 text-lg text-muted-foreground">
                        Your score:
                      </p>
                      <p className="my-4 text-6xl font-bold text-primary">
                        {Math.round((quizState.score / flashcards.length) * 100)}%
                      </p>
                      <p className="text-muted-foreground">({quizState.score} out of {flashcards.length} correct)</p>
                      <Button onClick={restartQuiz} className="mt-8">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex w-full items-center justify-between">
              <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0}>
                <ArrowLeft className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Previous</span>
              </Button>
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Card {currentIndex + 1} / {flashcards.length}
                </p>
                <Progress value={((currentIndex + 1) / flashcards.length) * 100} className="mt-1 w-32" />
              </div>
              <Button variant="outline" onClick={handleNext} disabled={currentIndex === flashcards.length - 1 || (mode === 'quiz' && !quizState.answers[currentCard.id])}>
                <span className="mr-2 hidden sm:inline">Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Tabs>
        )}
      </div>
    </main>
  );
}
