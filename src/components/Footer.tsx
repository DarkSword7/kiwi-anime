
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Users } from 'lucide-react'; // Placeholder for social/community icon

export function Footer() {
  const currentYear = new Date().getFullYear();

  const animeLinks = [
    { href: '/list/trending', label: 'Top Airing' },
    { href: '/list/popular', label: 'Popular Anime' },
    { href: '/catalogue?type=movie', label: 'Movies' },
    { href: '/catalogue?type=tv', label: 'TV Shows' },
  ];

  const resourceLinks = [
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'DMCA' },
    { href: '#', label: 'Terms of Use' },
    { href: '#', label: 'Contact Us' },
  ];

  return (
    <footer className="w-full border-t border-border/30 bg-card/30 text-muted-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Logo and Disclaimer */}
          <div className="md:col-span-5 lg:col-span-6 space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <Image
                src="/logo.png" // Assuming logo.png is in /public
                alt="Kiwi Anime Logo"
                width={180} // Adjust width as needed for footer
                height={40} // Adjust height as needed for footer
                className="h-10 w-auto" // Maintain aspect ratio, adjust height
                data-ai-hint="site logo anime"
              />
              {/* Kiwi Anime text removed */}
            </Link>
            <p className="text-sm leading-relaxed">
              Kiwi Anime does not store any files on our server. We are linked to media which is hosted on 3rd party services.
            </p>
          </div>

          {/* Spacer for medium screens */}
          <div className="hidden md:block md:col-span-1 lg:col-span-2"></div>

          {/* Anime Links */}
          <div className="md:col-span-3 lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-3">Anime</h3>
            <ul className="space-y-2">
              {animeLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="md:col-span-3 lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-3">Resources</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
          <p>&copy; {currentYear} Kiwi Anime. All rights reserved.</p>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {/* Placeholder for social icons */}
            <Link href="#" aria-label="Community" className="hover:text-primary transition-colors">
              <Users className="h-5 w-5" />
            </Link>
            {/* Add other icons/links here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
