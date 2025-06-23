import type { Flashcard } from './types';

// Simple shuffle function
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateQuizOptions(
  currentCard: Flashcard,
  allCards: Flashcard[],
  count: number = 4
): string[] {
  const correctAnswer = currentCard.meaning;

  // Get other meanings to use as incorrect options
  const distractors = allCards
    .filter(card => card.id !== currentCard.id)
    .map(card => card.meaning);
    
  // Shuffle distractors and pick the required number of them
  const shuffledDistractors = shuffleArray(distractors);
  const selectedDistractors = shuffledDistractors.slice(0, count - 1);

  const options = [correctAnswer, ...selectedDistractors];

  return shuffleArray(options);
}
