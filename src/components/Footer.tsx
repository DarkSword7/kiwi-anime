
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Users } from 'lucide-react'; // Placeholder for social/community icon

// KiwiIcon component defined directly in this file
const KiwiIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15.34 10.66a4 4 0 1 0-8.54-3.38"/>
    <path d="M8.43 10.08c-.19.64-.23 1.4.13 2.19A4 4 0 0 0 16.71 8.7"/>
    <path d="m10.5 10.5-2.02 2.02"/>
    <path d="M13.5 13.5 16 16"/>
    <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z"/>
    <path d="M12 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
    <path d="M15 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
    <path d="M9 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
  </svg>
);

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
              <KiwiIcon className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
              <span className="font-bold text-2xl text-foreground group-hover:text-accent transition-colors">
                Kiwi Anime
              </span>
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
