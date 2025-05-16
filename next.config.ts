import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.bunnycd.com', // Added for Consumet API images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co', // Fallback images from anilist if consumet fails for some reason
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
