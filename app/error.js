'use client';

export default function Error({ error, reset }) {
  return (
    <main className="route-error-page" role="alert">
      <span className="route-error-mark">✧</span>
      <p className="route-error-kicker">A LITTLE SNOWFALL INTERRUPTION</p>
      <h1>Let's try<br /><em>that again.</em></h1>
      <p>Đã có một trục trặc nhỏ khi mở khu vực này. Bạn có thể thử tải lại nội dung.</p>
      {process.env.NODE_ENV === 'development' && error?.message ? <small className="route-error-detail">{error.message}</small> : null}
      <button className="button button-gold" type="button" onClick={() => reset()}>Thử lại ↻</button>
    </main>
  );
}
