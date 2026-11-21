import WorldExplorer from '../../components/wonderland/WorldExplorer';

export const metadata = {
  title: 'Christmas World — Explore the Winter Village',
  description: 'Khám phá bản đồ tương tác của Christmas Wonderland: quảng trường ánh sáng, phiên chợ mùa đông, xưởng quà, rừng thông và những góc nhỏ ấm áp.',
  alternates: { canonical: '/world' },
  openGraph: { title: 'Christmas World', description: 'Khám phá ngôi làng mùa đông của Wonderland.', images: ['/christmas-world-map.webp'] },
};

export default function WorldPage() {
  return <WorldExplorer />;
}
