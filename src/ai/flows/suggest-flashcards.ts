'use server';

/**
 * @fileOverview AI-powered flashcard suggestion flow.
 *
 * - suggestFlashcards - A function that suggests flashcards based on a given topic.
 * - SuggestFlashcardsInput - The input type for the suggestFlashcards function.
 * - SuggestFlashcardsOutput - The return type for the suggestFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFlashcardsInputSchema = z.object({
  topic: z.string().describe('The topic for which flashcards are needed.'),
  numberOfFlashcards: z
    .number()
    .default(5)
    .describe('The number of flashcards to generate.'),
});
export type SuggestFlashcardsInput = z.infer<typeof SuggestFlashcardsInputSchema>;

const FlashcardSchema = z.object({
  word: z.string().describe('The English word.'),
  meaning: z.string().describe('The Vietnamese meaning of the word.'),
  example: z.string().optional().describe('An example usage of the word.'),
});

const SuggestFlashcardsOutputSchema = z.array(FlashcardSchema);
export type SuggestFlashcardsOutput = z.infer<typeof SuggestFlashcardsOutputSchema>;

export async function suggestFlashcards(input: SuggestFlashcardsInput): Promise<SuggestFlashcardsOutput> {
  return suggestFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFlashcardsPrompt',
  input: {schema: SuggestFlashcardsInputSchema},
  output: {schema: SuggestFlashcardsOutputSchema},
  prompt: `You are an AI assistant designed to suggest flashcards for language learners.
  The user will provide a topic, and you should generate a list of flashcards related to that topic.
  Each flashcard should contain an English word, its Vietnamese meaning, and an optional example sentence.
  Return a JSON array of flashcards. Here's the topic: {{{topic}}}.
  Please generate {{{numberOfFlashcards}}} flashcards.
  Ensure the flashcards are diverse and cover different aspects of the topic.
  The Vietnamese meanings should be accurate and easy to understand.
  The example sentences should be natural and helpful for learning the word in context.`,
});

const suggestFlashcardsFlow = ai.defineFlow(
  {
    name: 'suggestFlashcardsFlow',
    inputSchema: SuggestFlashcardsInputSchema,
    outputSchema: SuggestFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
