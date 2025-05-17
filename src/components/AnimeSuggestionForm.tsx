"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { suggestAnime, AnimeSuggestionOutput } from '@/ai/flows/anime-suggestion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wand2, Lightbulb } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, { message: "Anime title must be at least 2 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export function AnimeSuggestionForm() {
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setSuggestions(null);
    setError(null);
    try {
      const result: AnimeSuggestionOutput = await suggestAnime({ title: values.title });
      setSuggestions(result.suggestions);
    } catch (e) {
      setError("Failed to get suggestions. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl bg-card border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-foreground">
          <Wand2 className="mr-2 h-6 w-6 text-primary" />
          AI Anime Suggester
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter an anime title you like, and our AI will suggest similar ones!
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="animeTitle" className="text-base text-foreground/90">Anime Title</FormLabel>
                  <FormControl>
                    <Input 
                      id="animeTitle" 
                      placeholder="e.g., Attack on Titan" 
                      {...field} 
                      className="text-base py-6 bg-input border-border focus:border-primary placeholder-muted-foreground" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 bg-primary hover:bg-accent text-primary-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Getting Suggestions...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Get Suggestions
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {suggestions && suggestions.length > 0 && (
        <div className="p-6 border-t border-border/50">
          <h3 className="text-xl font-semibold mb-4 text-primary">Here are some suggestions:</h3>
          <ul className="space-y-2 list-disc list-inside pl-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-foreground/90 text-base">{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      {suggestions && suggestions.length === 0 && !error && (
         <div className="p-6 border-t border-border/50 text-center text-muted-foreground">
            <p>No suggestions found based on your input. Try a different title!</p>
          </div>
      )}
    </Card>
  );
}
