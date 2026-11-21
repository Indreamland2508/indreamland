'use client';

import { useEffect, useMemo, useState } from 'react';
import SiteHeader from './SiteHeader';

const places = [
  {
    id: 'square',
    number: '01',
    name: 'Christmas Square',
    vietnamese: 'Quảng trường Ánh Sáng',
    category: 'THE HEART OF WONDERLAND',
    icon: '✦',
    x: 51,
    y: 48,
    description: 'Trái tim của ngôi làng nằm dưới tán cây thông khổng lồ. Đèn vàng thắp sáng quảng trường, những hộp quà xếp quanh đài phun tuyết và tiếng chuông ngân vang trong đêm đông.',
    highlights: ['Cây thông lớn', 'Đài phun tuyết', 'Lễ thắp sáng'],
    tip: 'Hãy ghé quảng trường khi trời tối để ngắm cả ngôi làng bừng sáng.',
  },
  {
    id: 'market',
    number: '02',
    name: 'Holiday Market',
    vietnamese: 'Phiên Chợ Mùa Đông',
    category: 'LITTLE JOYS & WARM TREATS',
    icon: '❄',
    x: 19,
    y: 45,
    description: 'Những quầy gỗ nhỏ thơm mùi bánh gừng, quế và chocolate nóng. Dạo qua phiên chợ, ngắm đồ thủ công và tìm một món quà bé xinh dành cho người bạn thương quý.',
    highlights: ['Bánh gừng', 'Chocolate nóng', 'Quà thủ công'],
    tip: 'Thử tưởng tượng món quà nhỏ nhất cũng có thể mang lại niềm vui lớn nhất.',
  },
  {
    id: 'workshop',
    number: '03',
    name: "Santa's Workshop",
    vietnamese: 'Xưởng Quà Của Ông Noel',
    category: 'MADE WITH WONDER',
    icon: '🎁',
    x: 77,
    y: 30,
    description: 'Phía sau ô cửa sáng đèn là một xưởng quà rộn ràng. Những món đồ chơi được gói bằng giấy đỏ, buộc ruy băng vàng và gửi đi cùng lời chúc ấm áp.',
    highlights: ['Góc gói quà', 'Bưu thiếp', 'Danh sách điều ước'],
    tip: 'Bạn có thể ghé Christmas Studio để tự tạo một tấm thiệp mang dấu ấn riêng.',
  },
  {
    id: 'forest',
    number: '04',
    name: 'Whispering Forest',
    vietnamese: 'Rừng Thông Thì Thầm',
    category: 'A QUIET WINTER ESCAPE',
    icon: '✧',
    x: 14,
    y: 18,
    description: 'Con đường nhỏ len giữa những hàng thông phủ tuyết. Đèn lồng dẫn lối qua khu rừng yên tĩnh, nơi chỉ còn tiếng gió và những bông tuyết chạm nhẹ lên cành cây.',
    highlights: ['Lối mòn tuyết', 'Đèn lồng', 'Góc ngắm sao'],
    tip: 'Hãy chậm lại một chút và tận hưởng khoảng lặng giữa mùa lễ hội.',
  },
  {
    id: 'bridge',
    number: '05',
    name: 'Lantern Bridge',
    vietnamese: 'Cầu Đèn Lồng',
    category: 'FOLLOW THE GLOW',
    icon: '⌁',
    x: 58,
    y: 78,
    description: 'Chiếc cầu đá bắc qua dòng sông mùa đông, được thắp sáng bởi những chiếc đèn lồng nhỏ. Mặt nước phản chiếu ánh vàng và đưa bạn đến một góc nhìn khác của ngôi làng.',
    highlights: ['Cầu đá', 'Đèn lồng', 'Dòng sông băng'],
    tip: 'Đây là một trong những góc đẹp nhất để lưu lại tấm postcard mùa đông.',
  },
  {
    id: 'inn',
    number: '06',
    name: 'The Cozy Inn',
    vietnamese: 'Quán Trọ Ấm Áp',
    category: 'A PLACE TO SLOW DOWN',
    icon: '⌂',
    x: 18,
    y: 70,
    description: 'Một căn nhà gỗ ấm áp nép bên rìa quảng trường. Lò sưởi đang cháy, chiếc ghế bành chờ sẵn và một tách cacao nóng khiến đêm đông trở nên dịu dàng hơn.',
    highlights: ['Lò sưởi', 'Cacao nóng', 'Góc đọc sách'],
    tip: 'Nếu muốn gửi một lời chúc, hãy mở Christmas Studio từ thanh điều hướng.',
  },
];

function Snowfall() {
  return (
    <div className="snowfall world-snowfall" aria-hidden="true">
      <div className="snow-layer snow-layer-back" />
      <div className="snow-layer snow-layer-mid" />
      <div className="snow-layer snow-layer-front" />
      <div className="snow-glints" />
    </div>
  );
}

export default function WorldExplorer() {
  const [selectedId, setSelectedId] = useState('square');
  const [visited, setVisited] = useState(['square']);
  const [visitedReady, setVisitedReady] = useState(false);
  const selectedPlace = useMemo(
    () => places.find((place) => place.id === selectedId) || places[0],
    [selectedId]
  );
  const isVisited = visited.includes(selectedPlace.id);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPlace = params.get('place');
    if (places.some((place) => place.id === requestedPlace)) setSelectedId(requestedPlace);

    try {
      const saved = JSON.parse(window.sessionStorage.getItem('christmas-wonderland:visited') || '[]');
      if (Array.isArray(saved)) {
        const validIds = saved.filter((id) => places.some((place) => place.id === id));
        setVisited(Array.from(new Set(['square', ...validIds])));
      }
    } catch {
      // Storage may be disabled; progress still works for the current render.
    }
    setVisitedReady(true);
  }, []);

  useEffect(() => {
    if (!visitedReady) return;
    try {
      window.sessionStorage.setItem('christmas-wonderland:visited', JSON.stringify(visited));
    } catch {
      // Keep the interactive map usable even when session storage is blocked.
    }
  }, [visited, visitedReady]);

  const choosePlace = (id) => setSelectedId(id);
  const markVisited = () => {
    setVisited((current) => current.includes(selectedPlace.id) ? current : [...current, selectedPlace.id]);
  };

  return (
    <main className="wonderland-site world-page" id="top">
      <div className="ambient-grain" aria-hidden="true" />
      <Snowfall />
      <SiteHeader />

      <section className="world-hero" aria-labelledby="world-title">
        <div className="world-hero-image" aria-hidden="true" />
        <div className="world-hero-grade" aria-hidden="true" />
        <div className="world-hero-content">
          <a href="/" className="world-back-link">← Trở về trang chủ</a>
          <div className="world-hero-kicker"><span /> YOUR MAP TO THE MAGIC <span /></div>
          <p className="world-hero-pretitle">The lights are calling</p>
          <h1 id="world-title">Christmas <em>World</em></h1>
          <p className="world-hero-description">Một ngôi làng phủ tuyết, sáu điểm dừng chân và vô vàn điều nhỏ bé đang chờ được khám phá.</p>
          <a href="#map" className="button button-gold world-hero-button">Bắt đầu hành trình <span>↓</span></a>
          <div className="world-hero-meta"><span>06 PLACES TO DISCOVER</span><i /> <span>ONE LITTLE WINTER WORLD</span></div>
        </div>
        <div className="world-hero-seal" aria-hidden="true"><span>FOLLOW</span><strong>✦</strong><span>THE LIGHTS</span></div>
      </section>

      <section className="world-map-section section-shell" id="map">
        <div className="section-kicker"><span>01</span><i /> FIND YOUR WAY THROUGH THE SNOW</div>
        <div className="world-map-heading">
          <div>
            <h2>One village.<br /><em>Many little wonders.</em></h2>
          </div>
          <div className="world-map-copy">
            <p>Chạm vào những dấu mốc đang phát sáng trên bản đồ để khám phá từng góc nhỏ của Wonderland.</p>
            <div className="world-progress" aria-live="polite">
              <div className="world-progress-label"><span>HÀNH TRÌNH CỦA BẠN</span><strong>{visited.length.toString().padStart(2, '0')} / 06</strong></div>
              <div className="world-progress-track"><i style={{ width: `${(visited.length / places.length) * 100}%` }} /></div>
            </div>
          </div>
        </div>

        <div className="world-map-viewport">
          <div className="world-map-stage" role="group" aria-label="Bản đồ tương tác của Christmas Wonderland">
            <div className="world-map-shade" aria-hidden="true" />
            <div className="world-map-label"><span className="world-map-star">✦</span><div><small>THE WINTER ATLAS</small><strong>Wonderland Village</strong></div></div>
            <div className="world-map-legend"><i /> Địa điểm có thể khám phá</div>
            {places.map((place) => (
              <button
                key={place.id}
                type="button"
                className={`world-pin${selectedId === place.id ? ' is-selected' : ''}${visited.includes(place.id) ? ' is-visited' : ''}`}
                style={{ left: `${place.x}%`, top: `${place.y}%` }}
                onClick={() => choosePlace(place.id)}
                aria-label={`Khám phá ${place.vietnamese}`}
                aria-pressed={selectedId === place.id}
              >
                <span className="world-pin-core">{place.icon}</span>
                <span className="world-pin-label">{place.name}</span>
              </button>
            ))}
            <div className="world-map-bottomline"><span>✧</span> TAP A LIGHT TO DISCOVER <span>✧</span></div>
          </div>
        </div>
        <p className="world-map-hint">Trên điện thoại, vuốt ngang bản đồ hoặc chọn địa điểm ở danh sách bên dưới.</p>

        <div className="world-selected-card" aria-live="polite">
          <div className="world-selected-visual" data-place={selectedPlace.id}>
            <span>{selectedPlace.number}</span>
            <strong>{selectedPlace.icon}</strong>
            <small>{selectedPlace.category}</small>
          </div>
          <div className="world-selected-copy">
            <span className="world-selected-kicker">{selectedPlace.category}</span>
            <h3>{selectedPlace.name}</h3>
            <p className="world-selected-vn">{selectedPlace.vietnamese}</p>
            <p className="world-selected-description">{selectedPlace.description}</p>
            <div className="world-tags">
              {selectedPlace.highlights.map((item) => <span key={item}>{item}</span>)}
            </div>
            <p className="world-local-tip"><b>Một gợi ý nhỏ</b> {selectedPlace.tip}</p>
            <button className={`button world-visited-button${isVisited ? ' is-done' : ''}`} type="button" onClick={markVisited} disabled={isVisited}>
              {isVisited ? '✓ Đã thêm vào hành trình' : 'Đánh dấu đã khám phá'}
            </button>
          </div>
        </div>
      </section>

      <section className="world-places-section">
        <div className="section-shell">
          <div className="section-kicker section-kicker-light"><span>02</span><i /> SIX STOPS, ONE WINTER STORY</div>
          <div className="world-places-heading">
            <h2>Choose your<br /><em>next little escape.</em></h2>
            <p>Mỗi nơi có một nhịp điệu riêng. Bạn muốn ghé đâu tiếp theo?</p>
          </div>
          <div className="world-place-grid">
            {places.map((place, index) => (
              <button
                className={`world-place-card${selectedId === place.id ? ' is-active' : ''}`}
                key={place.id}
                type="button"
                onClick={() => {
                  choosePlace(place.id);
                  document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <span className={`world-place-thumb world-thumb-${place.id}`}><i>{place.icon}</i><small>{place.number} / 06</small></span>
                <span className="world-place-card-copy"><small>{place.category}</small><strong>{place.vietnamese}</strong><em>{place.name}</em></span>
                <span className="world-place-arrow">↗</span>
                {visited.includes(place.id) && <span className="world-place-visited">ĐÃ GHÉ THĂM</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="world-closing section-shell">
        <span className="section-kicker"><span>03</span><i /> THE MAGIC DOESN'T END HERE</span>
        <div className="world-closing-row">
          <div><h2>Take a little<br /><em>magic with you.</em></h2><p>Rời ngôi làng với một lời chúc, một tấm thiệp hoặc một kỷ niệm nhỏ để mang theo.</p></div>
          <div className="world-closing-actions"><a className="button button-gold" href="/#studio">Tạo thiệp Giáng sinh ↗</a><a className="world-home-link" href="/">Trở về trang chủ</a></div>
        </div>
      </section>

      <footer className="wonder-footer">
        <a className="footer-brand" href="/"><span>✦</span> Christmas <em>Wonderland</em></a>
        <p>A little world made of winter lights and warm wishes.</p>
        <div className="footer-links"><a href="/">Home</a><a href="/#stories">Stories</a><a href="/#studio">Create a card</a><a href="/#countdown">Countdown</a></div>
        <small>© Christmas Wonderland · A little magic lives here.</small>
      </footer>
      <a className="back-to-top" href="#top" aria-label="Lên đầu trang">↑</a>
    </main>
  );
}
