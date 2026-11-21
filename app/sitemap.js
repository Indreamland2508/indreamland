const siteUrl = 'https://indreamland.id.vn';

export default function sitemap() {
  const lastModified = new Date();
  return [
    { url: siteUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/world`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/experiences`, lastModified, changeFrequency: 'monthly', priority: 0.85 },
  ];
}
