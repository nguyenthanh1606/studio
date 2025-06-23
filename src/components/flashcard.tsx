"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Volume2 } from 'lucide-react';

interface FlashcardProps {
  word: string;
  meaning: string;
  example?: string;
}

export function Flashcard({ word, meaning, example }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className="group h-[350px] w-full cursor-pointer [perspective:1000px]"
      onClick={handleFlip}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-xl shadow-lg transition-transform duration-700 [transform-style:preserve-3d]',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
      >
        {/* Front of the card */}
        <div className="absolute flex h-full w-full flex-col items-center justify-center rounded-xl border-2 bg-card p-6 [backface-visibility:hidden]">
          <div className="flex items-center gap-4">
            <h2 className="text-center text-4xl font-bold md:text-5xl">{word}</h2>
            <Button variant="ghost" size="icon" onClick={handlePronounce} aria-label={`Pronounce ${word}`}>
                <Volume2 className="h-7 w-7 text-muted-foreground" />
            </Button>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">Click card to flip</p>
        </div>

        {/* Back of the card */}
        <div className="absolute h-full w-full rounded-xl border-2 bg-card p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-3xl font-semibold text-primary">{meaning}</p>
            {example && (
              <div className="mt-6">
                <p className="text-sm font-medium text-muted-foreground">Example:</p>
                <p className="mt-1 text-lg italic">"{example}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
