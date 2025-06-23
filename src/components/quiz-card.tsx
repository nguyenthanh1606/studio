"use client";

import type { Flashcard } from '@/lib/types';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizCardProps {
  card: Flashcard;
  options: string[];
  onSelectAnswer: (answer: string) => void;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
}

export function QuizCard({ card, options, onSelectAnswer, selectedAnswer, isCorrect }: QuizCardProps) {
  const isAnswered = selectedAnswer !== null;

  const getButtonVariant = (option: string) => {
    if (!isAnswered) return 'outline';
    if (option === card.meaning) return 'default'; // Correct answer
    if (option === selectedAnswer) return 'destructive'; // Incorrect selected answer
    return 'outline';
  };

  return (
    <div className="flex h-[350px] w-full flex-col items-center justify-center rounded-xl border-2 bg-card p-6">
      <h2 className="text-center text-3xl font-bold md:text-4xl">{card.word}</h2>
      <p className="mt-2 text-muted-foreground">What is the meaning of this word?</p>
      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option, index) => (
          <Button
            key={index}
            variant={getButtonVariant(option)}
            className={cn(
              "h-auto min-h-12 w-full justify-between whitespace-normal py-3 text-left leading-tight",
              isAnswered && "cursor-not-allowed opacity-100",
              isAnswered && option !== card.meaning && option !== selectedAnswer && "opacity-50"
            )}
            onClick={() => onSelectAnswer(option)}
            disabled={isAnswered}
          >
            <span>{option}</span>
            {isAnswered && option === selectedAnswer && (
              isCorrect ? <CheckCircle2 className="h-5 w-5 text-white" /> : <XCircle className="h-5 w-5 text-white" />
            )}
            {isAnswered && option !== selectedAnswer && option === card.meaning && (
                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
