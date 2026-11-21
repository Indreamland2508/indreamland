import './globals.css';
import MotionDirector from '../components/wonderland/MotionDirector';

const siteUrl = 'https://indreamland.id.vn';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Christmas Wonderland — Step Into the Magic',
    template: '%s | Christmas Wonderland',
  },
  description: 'Khám phá thế giới Giáng sinh lung linh: ngôi làng tuyết, câu chuyện mùa lễ hội, hoạt động tương tác và xưởng tạo thiệp của riêng bạn.',
  applicationName: 'Christmas Wonderland',
  category: 'entertainment',
  alternates: { canonical: '/' },
  keywords: ['Christmas Wonderland', 'Giáng sinh', 'Christmas village', 'Christmas card', 'winter wonderland', 'thiệp Giáng sinh'],
  openGraph: {
    title: 'Christmas Wonderland',
    description: 'A season of wonder, warmth and little moments of magic.',
    url: siteUrl,
    siteName: 'Christmas Wonderland',
    locale: 'vi_VN',
    type: 'website',
    images: [{ url: '/christmas-village.webp', width: 1536, height: 1024, alt: 'Ngôi làng Giáng sinh phủ tuyết' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Christmas Wonderland',
    description: 'Step into a little world of winter lights and warm wishes.',
    images: ['/christmas-village.webp'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/icon.svg' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#3b0e1e',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <MotionDirector />
        {children}
      </body>
    </html>
  );
}
