import { AnimeSuggestionForm } from '@/components/AnimeSuggestionForm';

export default function SuggestPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-3">
          Discover Your Next Binge
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Not sure what to watch? Let our AI help you find anime with similar themes to your favorites.
        </p>
      </div>
      <AnimeSuggestionForm />
    </div>
  );
}
