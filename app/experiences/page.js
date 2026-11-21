import ExperiencesPage from '../../components/wonderland/ExperiencesPage';

export const metadata = {
  title: 'Christmas Experiences — Little Moments of Magic',
  description: 'Mở món quà bất ngờ, chơi Christmas Memory Match và gửi một điều ước trong Christmas Wonderland.',
  alternates: { canonical: '/experiences' },
  openGraph: { title: 'Christmas Experiences', description: 'Những trải nghiệm Giáng sinh nho nhỏ dành cho bạn.', images: ['/christmas-village.webp'] },
};

export default function ExperiencesRoute() {
  return <ExperiencesPage />;
}
