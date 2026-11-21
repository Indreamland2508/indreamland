import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="route-error-page">
      <span className="route-error-mark">❄</span>
      <p className="route-error-kicker">A LITTLE DETOUR IN THE SNOW</p>
      <h1>Lost in the<br /><em>Winter Wonderland?</em></h1>
      <p>Con đường này chưa có trên bản đồ. Hãy quay lại quảng trường và tiếp tục hành trình nhé.</p>
      <Link className="button button-gold" href="/">Trở về trang chủ ↗</Link>
    </main>
  );
}
