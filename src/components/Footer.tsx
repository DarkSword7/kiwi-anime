
export function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-border/50">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Kiwi Anime. All rights reserved.</p>
        <p className="mt-1">Discover your next favorite anime with Kiwi Anime.</p>
      </div>
    </footer>
  );
}
