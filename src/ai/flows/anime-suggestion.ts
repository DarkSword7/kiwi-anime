'use server';
/**
 * @fileOverview Provides anime suggestions based on a user-provided title.
 *
 * - suggestAnime - A function that suggests anime titles based on a similar theme.
 * - AnimeSuggestionInput - The input type for the suggestAnime function.
 * - AnimeSuggestionOutput - The return type for the suggestAnime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnimeSuggestionInputSchema = z.object({
  title: z.string().describe('The title of the anime to find suggestions for.'),
});
export type AnimeSuggestionInput = z.infer<typeof AnimeSuggestionInputSchema>;

const AnimeSuggestionOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of anime titles with similar themes.'),
});
export type AnimeSuggestionOutput = z.infer<typeof AnimeSuggestionOutputSchema>;

export async function suggestAnime(input: AnimeSuggestionInput): Promise<AnimeSuggestionOutput> {
  return suggestAnimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'animeSuggestionPrompt',
  input: {schema: AnimeSuggestionInputSchema},
  output: {schema: AnimeSuggestionOutputSchema},
  prompt: `You are an AI anime expert. A user has entered the anime title "{{title}}".  Suggest other anime titles with similar themes to the user's entry.  Return a list of suggestions. Do not include any additional information beyond the list of titles. Limit the list to 5 titles.`, // Changed: included the anime title in the prompt and added instructions
});

const suggestAnimeFlow = ai.defineFlow(
  {
    name: 'suggestAnimeFlow',
    inputSchema: AnimeSuggestionInputSchema,
    outputSchema: AnimeSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
