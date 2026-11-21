export default function manifest() {
  return {
    name: 'Christmas Wonderland',
    short_name: 'Wonderland',
    description: 'A little world of winter lights and warm wishes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#19070f',
    theme_color: '#3b0e1e',
    lang: 'vi',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
