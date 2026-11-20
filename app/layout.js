import './globals.css';

export const metadata = {
  title: 'Merry Christmas — Phòng khách Giáng sinh',
  description: 'Một căn phòng ấm áp để cả nhà gặp gỡ, trò chuyện và gửi lời chúc Giáng sinh.',
  themeColor: '#0b211d',
};

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
