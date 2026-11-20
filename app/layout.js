import './globals.css';
export const metadata = { title: 'Phòng khách Giáng sinh', description: 'Quây quần bên lò sưởi, nói chuyện cùng cả nhà' };
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600&family=Pacifico&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
