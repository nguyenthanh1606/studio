'use server';

/**
 * @fileOverview AI-powered topic suggestion flow.
 *
 * - suggestTopic - A function that suggests a random topic for learning Vietnamese.
 * - SuggestTopicOutput - The return type for the suggestTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTopicOutputSchema = z.object({
  topic: z.string().describe('A random, interesting topic for learning Vietnamese vocabulary. It should be relatively simple, like "Common fruits" or "Animals at the zoo".'),
});
export type SuggestTopicOutput = z.infer<typeof SuggestTopicOutputSchema>;

export async function suggestTopic(): Promise<SuggestTopicOutput> {
  return suggestTopicFlow();
}

const prompt = ai.definePrompt({
  name: 'suggestTopicPrompt',
  output: {schema: SuggestTopicOutputSchema},
  prompt: `You are an AI assistant for a language learning app that helps users learn Vietnamese.
Your task is to suggest a single, random, interesting topic for a user.
The topic should be specific enough to generate a good set of flashcards, for example "Common kitchen items", "Items in a living room", or "Basic greetings".
Please provide just the topic as a string in the 'topic' field of the output JSON. Do not add any extra text or explanation.`,
});

const suggestTopicFlow = ai.defineFlow(
  {
    name: 'suggestTopicFlow',
    outputSchema: SuggestTopicOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
