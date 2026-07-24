import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Base URL of the application (set this in your Vercel or hosting environment variables)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ignite-platform.vercel.app';

  // Core public routes that we want indexed by Google
  const routes = [
    '',
    '/login',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));
}
