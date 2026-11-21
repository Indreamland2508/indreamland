'use client';

import { useState } from 'react';
import SiteHeader from './SiteHeader';
import Countdown from './Countdown';
import GreetingStudioModal from './GreetingStudioModal';
import GalleryLightbox from './GalleryLightbox';

function Snowfall({ enabled }) {
  if (!enabled) return null;
  return (
    <div className="snowfall" aria-hidden="true">
      <div className="snow-layer snow-layer-back" />
      <div className="snow-layer snow-layer-mid" />
      <div className="snow-layer snow-layer-front" />
      <div className="snow-glints" />
    </div>
  );
}

function FeatureCard({ number, title, description, image, icon, href, onClick, tone = '' }) {
  return (
    <a className={`feature-card ${tone}`} href={href} onClick={onClick} style={{ '--feature-image': `url("${image}")` }}>
      <span className="feature-image" aria-hidden="true" />
      <span className="feature-vignette" aria-hidden="true" />
      <span className="feature-topline"><small>{number} / WONDERLAND</small><span aria-hidden="true">↗</span></span>
      <span className="feature-card-content">
        <span className="feature-icon" aria-hidden="true">{icon}</span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
    </a>
  );
}

export default function WonderlandHome() {
  const [studioOpen, setStudioOpen] = useState(false);
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [galleryActive, setGalleryActive] = useState(null);
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="wonderland-site" id="top">
      <div className="ambient-grain" aria-hidden="true" />
      <Snowfall enabled={snowEnabled} />
      <SiteHeader onCreateCard={() => setStudioOpen(true)} />

      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-color-grade" aria-hidden="true" />
        <div className="hero-light-orb hero-light-one" aria-hidden="true" />
        <div className="hero-light-orb hero-light-two" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-eyebrow"><span /> A SEASON OF WONDER, WARMTH & LITTLE MOMENTS OF MAGIC <span /></div>
          <p className="hero-pretitle">Welcome to</p>
          <h1 id="hero-title"><span>Christmas</span><em>Wonderland</em></h1>
          <p className="hero-description">Một thế giới mùa đông đang chờ bạn khám phá.<br className="desktop-break" /> Chạm vào phép màu, tạo nên kỷ niệm và gửi đi chút ấm áp.</p>
          <div className="hero-actions">
            <a className="button button-gold hero-primary" href="/world">
              Khám phá Wonderland <span aria-hidden="true">↗</span>
            </a>
            <button className="button button-glass" type="button" onClick={() => setStudioOpen(true)}>
              <span aria-hidden="true">✧</span> Tạo thiệp Giáng sinh
            </button>
          </div>
          <div className="hero-note"><span className="note-line" /> EVERY CORNER HOLDS A LITTLE MAGIC <span className="note-star">✦</span></div>
        </div>

        <aside className="hero-countdown-card">
          <div className="countdown-card-top"><span className="countdown-gift" aria-hidden="true">✧</span><div><small>THE MAGIC RETURNS</small><strong>Christmas is coming</strong></div></div>
          <Countdown compact />
          <a href="#countdown" className="countdown-link">Xem đếm ngược <span aria-hidden="true">→</span></a>
        </aside>

        <div className="hero-bottom-meta">
          <span><i className="status-dot" /> A LITTLE MORE MAGIC EVERY DAY</span>
          <button className={`snow-toggle${snowEnabled ? ' active' : ''}`} type="button" onClick={() => setSnowEnabled((value) => !value)} aria-pressed={snowEnabled}>
            <span aria-hidden="true">❄</span> {snowEnabled ? 'Tắt tuyết' : 'Bật tuyết'}
          </button>
        </div>
        <button className="scroll-cue" type="button" onClick={() => scrollTo('explore')} aria-label="Cuộn xuống khám phá">
          <span>SCROLL TO DISCOVER</span><i>↓</i>
        </button>
      </section>

      <section className="intro-section section-shell" id="explore">
        <div className="section-kicker"><span>01</span><i /> THE WONDER STARTS HERE</div>
        <div className="intro-grid">
          <div>
            <h2>Follow the lights.<br /><em>Find your wonder.</em></h2>
          </div>
          <div className="intro-copy">
            <p>Rời khỏi nhịp sống vội vàng một chút. Dạo qua ngôi làng phủ tuyết, ghé xưởng quà, khám phá những câu chuyện mùa lễ hội và tự tạo một tấm thiệp mang dấu ấn của bạn.</p>
            <span className="intro-signature">Your Christmas story begins here <b>✦</b></span>
          </div>
        </div>

        <div className="feature-grid">
          <FeatureCard number="01" title="The Snowy Village" description="Bước vào ngôi làng mùa đông" image="/christmas-village.webp" icon="⌂" href="/world" />
          <FeatureCard number="02" title="Christmas Stories" description="Những câu chuyện của mùa lễ hội" image="/christmas-lounge.webp" icon="✧" href="#stories" />
          <FeatureCard number="03" title="Create & Send" description="Tạo thiệp, gửi lời chúc của riêng bạn" image="/christmas-village.webp" icon="✉" href="#studio" onClick={(event) => { event.preventDefault(); setStudioOpen(true); }} tone="feature-card-studio" />
          <FeatureCard number="04" title="Festive Moments" description="Thử những hoạt động nho nhỏ" image="/christmas-lounge.webp" icon="❄" href="/experiences" />
        </div>
      </section>

      <section className="world-section" id="world">
        <div className="world-backdrop" aria-hidden="true" />
        <div className="world-content section-shell">
          <div className="section-kicker section-kicker-light"><span>02</span><i /> A WORLD TO GET LOST IN</div>
          <div className="world-heading-row">
            <div>
              <p className="world-overline">BEYOND THE SNOWFALL</p>
              <h2>Welcome to the<br /><em>Winter Village</em></h2>
            </div>
            <p className="world-description">Từ quảng trường rực sáng đến những căn nhà nhỏ bên rừng thông — mỗi góc đều cất giữ một điều bất ngờ.</p>
          </div>
          <div className="world-destinations">
            <a className="destination destination-large" href="/world?place=square#map">
              <span className="destination-index">01 / THE HEART OF WONDERLAND</span>
              <span className="destination-bottom"><strong>Christmas Square</strong><small>Quảng trường ánh sáng</small><i>↗</i></span>
            </a>
            <a className="destination destination-market" href="/world?place=market#map">
              <span className="destination-index">02 / LITTLE JOYS</span>
              <span className="destination-bottom"><strong>Holiday Market</strong><small>Phiên chợ mùa đông</small><i>↗</i></span>
            </a>
            <a className="destination destination-lounge" href="/world?place=inn#map">
              <span className="destination-index">03 / SLOW DOWN</span>
              <span className="destination-bottom"><strong>The Cozy Corner</strong><small>Một góc nhỏ bình yên</small><i>↗</i></span>
            </a>
          </div>
        </div>
      </section>

      <section className="stories-section section-shell" id="stories">
        <div className="section-kicker"><span>03</span><i /> STORIES TO KEEP CLOSE</div>
        <div className="stories-heading-row">
          <h2>Little stories,<br /><em>warm memories.</em></h2>
          <p>Giáng sinh không chỉ là một ngày trong năm. Đó là những truyền thống, những câu chuyện và cảm giác thân thuộc mà ta luôn muốn quay về.</p>
        </div>
        <div className="story-list">
          <article className="story-item"><span className="story-number">01</span><div><small>THE ORIGIN</small><h3>Vì sao chúng ta trang trí cây thông?</h3><p>Khám phá biểu tượng xanh của mùa lễ hội và những phong tục đã đi qua nhiều thế hệ.</p></div><span className="story-arrow">↗</span></article>
          <article className="story-item"><span className="story-number">02</span><div><small>THE LEGEND</small><h3>Hành trình của ông già Noel</h3><p>Từ những câu chuyện dân gian đến hình ảnh người mang quà trong đêm đông.</p></div><span className="story-arrow">↗</span></article>
          <article className="story-item"><span className="story-number">03</span><div><small>THE FEELING</small><h3>Những điều nhỏ làm nên phép màu</h3><p>Một lời chúc, một chiếc bánh ấm, hay thời gian dành cho những người ta yêu quý.</p></div><span className="story-arrow">↗</span></article>
        </div>
      </section>

      <section className="studio-banner" id="studio">
        <div className="studio-banner-image" aria-hidden="true" />
        <div className="studio-banner-shade" aria-hidden="true" />
        <div className="studio-banner-content">
          <span className="section-kicker section-kicker-light"><span>04</span><i /> MADE WITH A LITTLE LOVE</span>
          <h2>A wish made<br /><em>just for you.</em></h2>
          <p>Chọn sắc màu, viết lời chúc và tạo một tấm thiệp Giáng sinh để gửi đến người đặc biệt.</p>
          <button className="button button-gold" type="button" onClick={() => setStudioOpen(true)}>Mở Christmas Studio <span aria-hidden="true">↗</span></button>
        </div>
        <div className="studio-stamp" aria-hidden="true"><span>MADE WITH</span><strong>♥</strong><span>WONDER</span></div>
      </section>

      <section className="activities-section section-shell" id="activities">
        <div className="section-kicker"><span>05</span><i /> SMALL THINGS, BIG SMILES</div>
        <div className="activities-heading-row">
          <div><h2>Make a little<br /><em>Christmas magic.</em></h2></div>
          <p>Không cần kế hoạch lớn lao. Chỉ cần một hoạt động nho nhỏ để mùa đông này trở nên đáng nhớ hơn.</p>
        </div>
        <div className="activity-grid">
          <a className="activity-tile activity-gift" href="/experiences#little-surprise"><span className="activity-emoji">🎁</span><small>A LITTLE SURPRISE</small><strong>Điều bất ngờ hôm nay</strong><span className="activity-action">Mở món quà bí mật <b>↗</b></span></a>
          <button className="activity-tile activity-wish" type="button" onClick={() => setStudioOpen(true)}><span className="activity-emoji">✉</span><small>WORDS FROM THE HEART</small><strong>Gửi một lời chúc</strong><span className="activity-action">Tạo thiệp của bạn <b>↗</b></span></button>
          <a className="activity-tile activity-gallery" href="#gallery"><span className="activity-emoji">✧</span><small>KEEP THE MOMENT</small><strong>Lưu lại khoảnh khắc</strong><span className="activity-action">Khám phá thư viện <b>↗</b></span></a>
        </div>
        <div className="activities-more"><p>Mở thêm những trải nghiệm nhỏ trong thế giới Giáng sinh.</p><a href="/experiences">Khám phá tất cả hoạt động <span>↗</span></a></div>
      </section>

      <section className="gallery-section" id="gallery">
        <div className="gallery-inner section-shell">
          <div className="section-kicker section-kicker-light"><span>06</span><i /> A POSTCARD FROM WINTER</div>
          <div className="gallery-heading-row"><h2>Moments of<br /><em>winter wonder.</em></h2><p>Một vài khung cảnh để bạn dừng lại, ngắm nhìn và cảm nhận mùa lễ hội.</p></div>
          <div className="gallery-grid">
            <button className="gallery-photo gallery-photo-village" type="button" onClick={() => setGalleryActive(0)} aria-label="Mở ảnh The Winter Village">
              <span>01 / THE VILLAGE</span><i aria-hidden="true">↗</i>
            </button>
            <button className="gallery-photo gallery-photo-room" type="button" onClick={() => setGalleryActive(1)} aria-label="Mở ảnh The Cozy Night">
              <span>02 / THE COZY NIGHT</span><i aria-hidden="true">↗</i>
            </button>
            <div className="gallery-note"><span>“</span><p>May your days be merry, your heart be light, and your winter be filled with wonder.</p><small>A CHRISTMAS WISH</small></div>
          </div>
        </div>
      </section>

      <section className="countdown-section section-shell" id="countdown">
        <div className="countdown-art" aria-hidden="true"><span>✦</span><span>✧</span><span>❄</span></div>
        <div className="countdown-copy"><span className="section-kicker"><span>07</span><i /> SAVE A LITTLE WONDER</span><h2>The most wonderful<br /><em>time is almost here.</em></h2><p>Hãy để dành một chút háo hức cho ngày đặc biệt nhất của mùa đông.</p></div>
        <Countdown />
      </section>

      <footer className="wonder-footer">
        <a className="footer-brand" href="#top"><span>✦</span> Christmas <em>Wonderland</em></a>
        <p>Made with a little wonder, for everyone who loves Christmas.</p>
        <div className="footer-links"><a href="#top">Home</a><a href="#explore">Explore</a><a href="#studio" onClick={(event) => { event.preventDefault(); setStudioOpen(true); }}>Create a card</a><a href="#countdown">Countdown</a></div>
        <small>© Christmas Wonderland · A little magic lives here.</small>
      </footer>

      <button className="back-to-top" type="button" onClick={() => scrollTo('top')} aria-label="Lên đầu trang">↑</button>
      <GalleryLightbox activeIndex={galleryActive} onChange={setGalleryActive} onClose={() => setGalleryActive(null)} />
      <GreetingStudioModal open={studioOpen} onClose={() => setStudioOpen(false)} />
    </main>
  );
}
