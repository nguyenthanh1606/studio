'use server';

import { suggestFlashcards, SuggestFlashcardsOutput } from '@/ai/flows/suggest-flashcards';
import { suggestTopic } from '@/ai/flows/suggest-topic';

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

export async function getSuggestedTopic(): Promise<{ topic: string } | { error: string }> {
  try {
    const result = await suggestTopic();
    return { topic: result.topic };
  } catch (error) {
    console.error('Error suggesting topic:', error);
    return { error: 'Failed to suggest a topic. Please try again.' };
  }
}
