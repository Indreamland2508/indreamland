'use client';

import { useEffect, useRef, useState } from 'react';
import SiteHeader from './SiteHeader';
import GreetingStudioModal from './GreetingStudioModal';

const surpriseDeck = {
  cozy: [
    { title: 'A slower kind of evening', text: 'Pha một món đồ uống ấm, chọn một bản nhạc dịu dàng và dành 20 phút thật chậm cho chính mình.', tag: 'A MOMENT FOR YOU', icon: '☕' },
    { title: 'A little winter ritual', text: 'Bật một chiếc đèn vàng, đọc vài trang sách và để điện thoại nghỉ ngơi một lúc.', tag: 'SLOW DOWN', icon: '🕯️' },
    { title: 'The comfort list', text: 'Viết ra ba điều nhỏ khiến bạn thấy biết ơn trong năm nay. Đôi khi phép màu nằm ngay ở đó.', tag: 'A GENTLE REMINDER', icon: '✧' },
  ],
  kind: [
    { title: 'Send warmth their way', text: 'Nhắn cho một người bạn lâu rồi chưa trò chuyện. Chỉ một câu hỏi thăm cũng có thể làm ngày của họ vui hơn.', tag: 'A KIND LITTLE THING', icon: '💌' },
    { title: 'A gift without a ribbon', text: 'Giúp ai đó một việc nhỏ hôm nay mà không cần chờ được nhờ vả hay cảm ơn.', tag: 'GIVE A LITTLE JOY', icon: '🎁' },
    { title: 'Make someone feel seen', text: 'Nói với một người bạn điều bạn thật sự trân trọng ở họ.', tag: 'WORDS THAT MATTER', icon: '❤️' },
  ],
  playful: [
    { title: 'Christmas movie night', text: 'Chọn một bộ phim mùa đông, chuẩn bị chút đồ ăn nhẹ và rủ một người bạn cùng xem.', tag: 'LET THE FUN BEGIN', icon: '🎬' },
    { title: 'A tiny photo quest', text: 'Tìm ba điều mang sắc đỏ, xanh thông và vàng ấm quanh bạn rồi ghép thành một bức ảnh Giáng sinh.', tag: 'CAPTURE THE SEASON', icon: '📸' },
    { title: 'The secret playlist', text: 'Tạo một playlist 5 bài hát khiến bạn nhớ đến mùa lễ hội và chia sẻ với người bạn yêu quý.', tag: 'SOUNDTRACK OF JOY', icon: '🎶' },
  ],
};

const memorySymbols = ['🎄', '🎁', '🔔', '⭐', '🍪', '❄️'];
const initialCards = memorySymbols.flatMap((symbol, index) => [
  { id: `${index}-a`, pair: index, symbol },
  { id: `${index}-b`, pair: index, symbol },
]);

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export default function ExperiencesPage() {
  const [studioOpen, setStudioOpen] = useState(false);
  const [mood, setMood] = useState('cozy');
  const [surprise, setSurprise] = useState(null);
  const [cards, setCards] = useState(initialCards);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [wishName, setWishName] = useState('');
  const [wishText, setWishText] = useState('');
  const [wishes, setWishes] = useState([]);
  const [wishesReady, setWishesReady] = useState(false);
  const [wishNotice, setWishNotice] = useState('');
  const matchTimeoutRef = useRef(null);

  const matchedPairs = matched.length / 2;

  useEffect(() => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem('christmas-wonderland:wishes') || '[]');
      if (Array.isArray(saved)) {
        setWishes(saved.filter((wish) => wish && typeof wish.id === 'string' && typeof wish.text === 'string' && typeof wish.name === 'string').slice(0, 6));
      }
    } catch {
      // Storage may be disabled; the Wish Jar remains usable in memory.
    }
    setWishesReady(true);
  }, []);

  useEffect(() => {
    if (!wishesReady) return;
    try {
      window.sessionStorage.setItem('christmas-wonderland:wishes', JSON.stringify(wishes));
    } catch {
      // Do not block the activity if session storage is unavailable.
    }
  }, [wishes, wishesReady]);

  useEffect(() => () => {
    if (matchTimeoutRef.current) window.clearTimeout(matchTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (!gameStarted || gameWon || !startedAt) return undefined;
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [gameStarted, gameWon, startedAt]);

  useEffect(() => {
    if (gameStarted && matched.length === cards.length && cards.length > 0) setGameWon(true);
  }, [cards.length, gameStarted, matched.length]);

  const drawSurprise = () => {
    const options = surpriseDeck[mood] || surpriseDeck.cozy;
    const available = options.filter((item) => item.title !== surprise?.title);
    const pool = available.length ? available : options;
    setSurprise(pool[Math.floor(Math.random() * pool.length)]);
  };

  const startGame = () => {
    if (matchTimeoutRef.current) window.clearTimeout(matchTimeoutRef.current);
    setCards(shuffle(initialCards));
    setFlipped([]);
    setMatched([]);
    setLocked(false);
    setMoves(0);
    setElapsed(0);
    setStartedAt(Date.now());
    setGameStarted(true);
    setGameWon(false);
  };

  const flipCard = (card) => {
    if (!gameStarted || gameWon || locked || flipped.includes(card.id) || matched.includes(card.id)) return;

    if (flipped.length === 0) {
      setFlipped([card.id]);
      return;
    }

    const firstCard = cards.find((item) => item.id === flipped[0]);
    setFlipped([flipped[0], card.id]);
    setMoves((value) => value + 1);
    setLocked(true);

    if (firstCard && firstCard.pair === card.pair) {
      matchTimeoutRef.current = window.setTimeout(() => {
        setMatched((current) => [...current, firstCard.id, card.id]);
        setFlipped([]);
        matchTimeoutRef.current = null;
        setLocked(false);
      }, 420);
    } else {
      matchTimeoutRef.current = window.setTimeout(() => {
        setFlipped([]);
        setLocked(false);
        matchTimeoutRef.current = null;
      }, 920);
    }
  };

  const addWish = (event) => {
    event.preventDefault();
    const trimmed = wishText.trim();
    if (!trimmed) {
      setWishNotice('Hãy viết một điều ước trước khi thả vào chiếc lọ nhé.');
      return;
    }
    const nextWish = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: wishName.trim() || 'Một người bạn',
      text: trimmed,
    };
    setWishes((current) => [nextWish, ...current].slice(0, 6));
    setWishName('');
    setWishText('');
    setWishNotice('Điều ước đã được đặt vào chiếc lọ của bạn.');
  };

  const copyWish = async (wish) => {
    try {
      await navigator.clipboard.writeText(`Điều ước của ${wish.name}: ${wish.text}`);
      setWishNotice('Đã sao chép điều ước.');
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = `Điều ước của ${wish.name}: ${wish.text}`;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      const copied = document.execCommand('copy');
      fallback.remove();
      setWishNotice(copied ? 'Đã sao chép điều ước.' : 'Trình duyệt không cho phép sao chép tự động.');
    }
  };

  return (
    <main className="wonderland-site experiences-page" id="top">
      <div className="ambient-grain" aria-hidden="true" />
      <div className="snowfall" aria-hidden="true">
        <div className="snow-layer snow-layer-back" />
        <div className="snow-layer snow-layer-mid" />
        <div className="snow-layer snow-layer-front" />
      </div>
      <SiteHeader onCreateCard={() => setStudioOpen(true)} />

      <section className="experiences-hero">
        <div className="experiences-hero-image" aria-hidden="true" />
        <div className="experiences-hero-grade" aria-hidden="true" />
        <div className="experiences-hero-copy">
          <a href="/" className="experiences-back">← Trở về Wonderland</a>
          <span className="experiences-kicker">A LITTLE MAGIC, MADE INTERACTIVE</span>
          <h1>Make a little<br /><em>Christmas magic.</em></h1>
          <p>Ba trải nghiệm nhỏ để mùa đông thêm đáng nhớ: mở một điều bất ngờ, tìm những cặp biểu tượng mùa lễ hội và gửi một điều ước vào chiếc lọ của riêng bạn.</p>
          <div className="experiences-hero-actions">
            <a className="button button-gold" href="#little-surprise">Bắt đầu trải nghiệm ↓</a>
            <button className="button button-glass" type="button" onClick={() => setStudioOpen(true)}>Tạo thiệp Giáng sinh ✦</button>
          </div>
        </div>
        <div className="experiences-hero-seal"><span>THREE LITTLE</span><strong>✦</strong><span>WONDERS</span></div>
      </section>

      <section className="experience-section section-shell" id="little-surprise">
        <div className="section-kicker"><span>01</span><i /> OPEN A LITTLE SURPRISE</div>
        <div className="experience-heading-row">
          <h2>A gift for<br /><em>the moment.</em></h2>
          <p>Chọn tâm trạng của bạn rồi mở một gợi ý nho nhỏ. Không có điểm số hay áp lực — chỉ là một cách dịu dàng để làm ngày hôm nay khác đi.</p>
        </div>
        <div className="surprise-layout">
          <div className="surprise-controls">
            <span className="experience-overline">WHAT WOULD FEEL GOOD TODAY?</span>
            <div className="mood-options" role="group" aria-label="Chọn tâm trạng">
              <button className={mood === 'cozy' ? 'mood-option active' : 'mood-option'} type="button" onClick={() => { setMood('cozy'); setSurprise(null); }} aria-pressed={mood === 'cozy'}><span>☕</span><b>Chậm lại</b><small>Cozy</small></button>
              <button className={mood === 'kind' ? 'mood-option active' : 'mood-option'} type="button" onClick={() => { setMood('kind'); setSurprise(null); }} aria-pressed={mood === 'kind'}><span>💌</span><b>Trao yêu thương</b><small>Kind</small></button>
              <button className={mood === 'playful' ? 'mood-option active' : 'mood-option'} type="button" onClick={() => { setMood('playful'); setSurprise(null); }} aria-pressed={mood === 'playful'}><span>🎉</span><b>Vui một chút</b><small>Playful</small></button>
            </div>
            <button type="button" className="button button-gold surprise-draw" onClick={drawSurprise}>Mở món quà bí mật <span>✦</span></button>
          </div>
          <div className={`surprise-reveal${surprise ? ' is-revealed' : ''}`} aria-live="polite">
            {surprise ? (
              <div className="surprise-reveal-content">
                <span className="surprise-reveal-icon">{surprise.icon}</span>
                <small>{surprise.tag}</small>
                <h3>{surprise.title}</h3>
                <p>{surprise.text}</p>
                <span className="surprise-reveal-footer">A LITTLE MOMENT, JUST FOR YOU</span>
              </div>
            ) : (
              <div className="surprise-sealed">
                <span className="sealed-gift">🎁</span>
                <strong>A little something<br /><em>is waiting for you.</em></strong>
                <small>Chọn một tâm trạng và mở quà</small>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="experience-memory-section" id="memory-match">
        <div className="section-shell">
          <div className="section-kicker section-kicker-light"><span>02</span><i /> A LITTLE GAME FOR A WINTER NIGHT</div>
          <div className="experience-heading-row experience-heading-light">
            <h2>Find the pairs.<br /><em>Keep the wonder.</em></h2>
            <p>Lật hai tấm thẻ mỗi lượt để tìm những biểu tượng giống nhau. Ghép đủ sáu cặp để hoàn thành trò chơi.</p>
          </div>
          <div className="memory-game-panel">
            <div className="memory-game-topline">
              <div><span className="experience-overline">CHRISTMAS MEMORY MATCH</span><strong>{gameWon ? 'Bạn đã tìm đủ các cặp!' : gameStarted ? 'Tìm những cặp biểu tượng còn lại' : 'Sẵn sàng cho một vòng chơi?'}</strong></div>
              <div className="memory-stats"><span><small>LƯỢT</small><b>{moves}</b></span><span><small>THỜI GIAN</small><b>{formatTime(elapsed)}</b></span><span><small>ĐÃ GHÉP</small><b>{matchedPairs}/6</b></span></div>
            </div>
            <div className="memory-board" aria-label="Bảng trò chơi tìm cặp Giáng sinh">
              {cards.map((card) => {
                const isFaceUp = flipped.includes(card.id) || matched.includes(card.id);
                const isMatched = matched.includes(card.id);
                return (
                  <button key={card.id} type="button" className={`memory-card${isFaceUp ? ' is-face-up' : ''}${isMatched ? ' is-matched' : ''}`} onClick={() => flipCard(card)} disabled={!gameStarted || isMatched || locked} aria-label={isFaceUp ? `Biểu tượng ${card.symbol}` : 'Lật thẻ'}>
                    <span className="memory-card-back">✦</span>
                    <span className="memory-card-face">{card.symbol}</span>
                  </button>
                );
              })}
            </div>
            <div className="memory-game-footer">
              <p>{gameWon ? `Hoàn thành trong ${formatTime(elapsed)} với ${moves} lượt mở.` : 'Mẹo nhỏ: hãy ghi nhớ vị trí các biểu tượng đã lật.'}</p>
              <button className="button button-gold" type="button" onClick={startGame}>{gameStarted ? 'Chơi lại' : 'Bắt đầu chơi'} <span>↗</span></button>
            </div>
          </div>
        </div>
      </section>

      <section className="experience-section wish-section section-shell" id="wish-jar">
        <div className="section-kicker"><span>03</span><i /> A WISH TO KEEP CLOSE</div>
        <div className="wish-layout">
          <div className="wish-intro">
            <h2>Leave a wish.<br /><em>Let it glow.</em></h2>
            <p>Viết một điều bạn mong cho mùa lễ hội này. Điều ước sẽ nằm trong chiếc lọ của bạn để bạn có thể đọc lại hoặc sao chép gửi cho người mình quý mến.</p>
            <div className="wish-jar-art" aria-hidden="true"><span>✦</span><strong>WISH<br />JAR</strong><i>❄</i></div>
          </div>
          <div className="wish-workspace">
            <form className="wish-form" onSubmit={addWish}>
              <label>Tên hiển thị<input value={wishName} onChange={(event) => setWishName(event.target.value)} maxLength={28} placeholder="Một người bạn" /></label>
              <label>Điều ước của bạn<textarea value={wishText} onChange={(event) => setWishText(event.target.value)} maxLength={150} rows={3} placeholder="Mình mong mùa Giáng sinh này..." /></label>
              <div className="wish-form-bottom"><small>{wishText.length}/150 ký tự</small><button className="button button-gold" type="submit">Thả điều ước <span>✦</span></button></div>
            </form>
            {wishNotice && <p className="wish-notice" role="status">{wishNotice}</p>}
            <div className="wish-list" aria-live="polite">
              {wishes.length ? wishes.map((wish) => (
                <article className="wish-note" key={wish.id}>
                  <span>✧</span><p>{wish.text}</p><div><small>GỬI BỞI {wish.name}</small><button type="button" onClick={() => copyWish(wish)}>Sao chép ↗</button></div>
                </article>
              )) : (
                <div className="wish-empty"><span>✧</span><p>Chiếc lọ vẫn đang chờ điều ước đầu tiên.</p><small>YOUR WISHES WILL APPEAR HERE</small></div>
              )}
            </div>
            <p className="wish-local-note">Điều ước được giữ trong phiên tab hiện tại trên trình duyệt này; chúng không được đăng công khai hoặc gửi lên máy chủ.</p>
          </div>
        </div>
      </section>

      <section className="experience-closing">
        <div className="experience-closing-inner section-shell">
          <span className="section-kicker section-kicker-light"><span>✦</span><i /> TAKE THE MAGIC WITH YOU</span>
          <h2>Some things are better<br /><em>when shared.</em></h2>
          <p>Tạo một tấm thiệp nhỏ, gửi lời chúc và mang theo chút ấm áp từ Wonderland.</p>
          <div><button className="button button-gold" type="button" onClick={() => setStudioOpen(true)}>Mở Christmas Studio ↗</button><a className="button button-glass" href="/world">Tiếp tục khám phá</a></div>
        </div>
      </section>

      <footer className="wonder-footer">
        <a className="footer-brand" href="/"><span>✦</span> Christmas <em>Wonderland</em></a>
        <p>A little world made of winter lights and warm wishes.</p>
        <div className="footer-links"><a href="/">Home</a><a href="/world">Explore</a><a href="/#stories">Stories</a><a href="/experiences">Experiences</a></div>
        <small>© Christmas Wonderland · A little magic lives here.</small>
      </footer>
      <a className="back-to-top" href="#top" aria-label="Lên đầu trang">↑</a>
      <GreetingStudioModal open={studioOpen} onClose={() => setStudioOpen(false)} />
    </main>
  );
}
