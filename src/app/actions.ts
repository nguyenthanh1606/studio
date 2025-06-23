'use server';

import { suggestFlashcards, SuggestFlashcardsOutput } from '@/ai/flows/suggest-flashcards';

export async function getFlashcards(topic: string): Promise<SuggestFlashcardsOutput | { error: string }> {
  if (!topic) {
    return { error: 'Topic cannot be empty.' };
  }

  try {
    const flashcards = await suggestFlashcards({ topic, numberOfFlashcards: 20 });
    return flashcards;
  } catch (error) {
    console.error('Error suggesting flashcards:', error);
    return { error: 'Failed to generate flashcards. Please try again.' };
  }
}
