import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Base URL of the application
  const baseUrl = 'https://www.yourdomain.com';

  // Core public routes that we want indexed
  const routes = [
    '',
    '/login',
    '/about', // Example if you add one later
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));
}
