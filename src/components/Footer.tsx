import { Separator } from "./ui/separator";

export function Footer() {
  return (
    <footer className="w-full mt-auto border-t">
      <Separator />
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AniWave Lite. All rights reserved.</p>
        <p className="mt-1">Discover your next favorite anime.</p>
      </div>
    </footer>
  );
}
