'use client';
import { useEffect, useRef, useState } from 'react';
import { getSupabase } from '../lib/supabase';

const AVS = ['🎅', '🤶', '🦌', '⛄', '🧝', '🐻', '🐱', '🎁'];
const COLS = ['#ffb86b', '#8fd6a8', '#9cc9ff', '#ff9ec0', '#e6c3ff', '#fff08a'];
const SEAT_COUNT = 8;
const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const ls = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch { return null; } };
const colorOf = (n = '') => { let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) | 0; return COLS[Math.abs(h) % COLS.length]; };
const iceServers = () => {
  const s = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }];
  const u = process.env.NEXT_PUBLIC_TURN_URL;
  if (u) s.push({ urls: u.split(','), username: process.env.NEXT_PUBLIC_TURN_USERNAME, credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL });
  return s;
};

export default function Room() {
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState('');
  const [av, setAv] = useState(AVS[0]);
  const [peers, setPeers] = useState({});
  const [mySeat, setMySeat] = useState(-1);
  const [micOn, setMicOn] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [treeOff, setTreeOff] = useState(false);
  const R = useRef({ id: '', uid: '', ch: null, pcs: {}, trk: null, meta: {}, timer: 0, noteT: 0 }).current;
  const audios = useRef(null), box = useRef(null);

  const flash = (m) => { setNote(m); clearTimeout(R.noteT); R.noteT = setTimeout(() => setNote(''), 9000); };
  const upd = (p) => { R.meta = { ...R.meta, ...p }; R.ch && R.ch.track(R.meta); };
  const send = (p) => R.ch && R.ch.send({ type: 'broadcast', event: 'rtc', payload: { ...p, from: R.id } });

  useEffect(() => {
    R.id = rid(); R.uid = ls('xmas_uid') || rid(); ls('xmas_uid', R.uid);
    setName(ls('xmas_name') || ''); setAv(ls('xmas_av') || AVS[0]);
  }, []);

  /* ---------- voice (WebRTC mesh) ---------- */
  const closePc = (pc) => { try { pc.close(); } catch {} pc._a && pc._a.remove(); };
  const mk = (pid) => {
    const pc = new RTCPeerConnection({ iceServers: iceServers() }); pc._q = []; R.pcs[pid] = pc;
    pc.onicecandidate = (e) => e.candidate && send({ to: pid, k: 'c', c: e.candidate.toJSON() });
    pc.ontrack = (e) => {
      const a = pc._a || document.createElement('audio'); a.autoplay = true; a.playsInline = true;
      a.srcObject = new MediaStream([e.track]); pc._a = a; audios.current && audios.current.appendChild(a); a.play && a.play().catch(() => {});
    };
    pc.onconnectionstatechange = () => pc.connectionState === 'failed' && flash('Không kết nối được giọng nói với một người trong phòng. Hãy cấu hình TURN server để ổn định hơn.');
    return pc;
  };
  const attach = (pc) => {
    const tr = pc.getTransceivers()[0]; if (!tr) return; pc._tr = tr;
    try { tr.direction = 'sendrecv'; } catch {}
    R.trk && tr.sender.replaceTrack(R.trk).catch(() => {});
  };
  const call = (pid) => {
    const pc = mk(pid); pc.addTransceiver('audio', { direction: 'sendrecv' }); attach(pc);
    pc.createOffer().then((o) => pc.setLocalDescription(o)).then(() => send({ to: pid, k: 'o', s: pc.localDescription.sdp })).catch(() => {});
  };
  const onSig = (p) => {
    if (!p || p.to !== R.id) return;
    let pc = R.pcs[p.from];
    const flush = () => pc._q.splice(0).forEach((c) => pc.addIceCandidate(c).catch(() => {}));
    if (p.k === 'o') {
      if (pc) return; pc = mk(p.from);
      pc.setRemoteDescription({ type: 'offer', sdp: p.s }).then(() => { attach(pc); flush(); return pc.createAnswer(); })
        .then((a) => pc.setLocalDescription(a)).then(() => send({ to: p.from, k: 'a', s: pc.localDescription.sdp })).catch(() => {});
    } else if (p.k === 'a' && pc) pc.setRemoteDescription({ type: 'answer', sdp: p.s }).then(flush).catch(() => {});
    else if (p.k === 'c' && pc) pc.remoteDescription ? pc.addIceCandidate(p.c).catch(() => {}) : pc._q.push(p.c);
  };
  const toggleMic = async () => {
    if (!R.ch) return flash('Chưa kết nối được phòng.');
    if (R.trk) { R.trk.enabled = !R.trk.enabled; setMicOn(R.trk.enabled); upd({ mic: R.trk.enabled, speak: false }); return; }
    if (!navigator.mediaDevices?.getUserMedia) return flash('Trình duyệt không hỗ trợ micro. Hãy dùng Chrome hoặc Safari mới (trang phải chạy bằng https).');
    try {
      const st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      R.trk = st.getAudioTracks()[0]; setMicOn(true); upd({ mic: true });
      Object.values(R.pcs).forEach((pc) => pc._tr && pc._tr.sender.replaceTrack(R.trk).catch(() => {}));
      const ac = new (window.AudioContext || window.webkitAudioContext)(), an = ac.createAnalyser(); an.fftSize = 512;
      ac.createMediaStreamSource(st).connect(an); const buf = new Uint8Array(an.fftSize); let hold = 0, now = false;
      R.timer = setInterval(() => {
        if (!R.trk.enabled) return; an.getByteTimeDomainData(buf);
        let s = 0; for (const b of buf) { const v = (b - 128) / 128; s += v * v; }
        if (Math.sqrt(s / buf.length) > 0.04) hold = 4; else if (hold) hold--;
        if ((hold > 0) !== now) { now = hold > 0; upd({ speak: now }); }
      }, 120);
    } catch { flash('Chưa được phép dùng micro. Hãy cho phép micro cho trang này trong cài đặt trình duyệt.'); }
  };

  /* ---------- room: presence + signaling, chat ---------- */
  useEffect(() => {
    if (!joined) return;
    const sb = getSupabase();
    if (!sb) { flash('Chưa cấu hình Supabase (xem README).'); return; }
    R.meta = { name, av, seat: null, mic: false, speak: false, rtc: true };
    const ch = sb.channel('living-room', { config: { presence: { key: R.id }, broadcast: { self: false } } });
    R.ch = ch;
    ch.on('presence', { event: 'sync' }, () => {
      const st = ch.presenceState(), o = {}; for (const k in st) o[k] = st[k][st[k].length - 1]; setPeers(o);
    }).on('broadcast', { event: 'rtc' }, ({ payload }) => onSig(payload))
      .subscribe((s) => { if (s === 'SUBSCRIBED') ch.track(R.meta); });
    sb.from('messages').select('*').order('created_at', { ascending: false }).limit(150)
      .then(({ data }) => data && setMsgs(data.reverse()));
    const chat = sb.channel('chat-db').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
      (p) => setMsgs((m) => [...m, p.new].slice(-150))).subscribe();
    return () => {
      Object.values(R.pcs).forEach(closePc); R.pcs = {}; clearInterval(R.timer);
      R.trk && R.trk.stop(); R.trk = null; sb.removeChannel(ch); sb.removeChannel(chat); R.ch = null;
    };
  }, [joined]);

  const occ = {};
  Object.keys(peers).sort().forEach((k) => { const s = peers[k].seat; if (typeof s === 'number' && !(s in occ)) occ[s] = k; });

  useEffect(() => {
    if (!joined) return;
    if (mySeat >= 0 && occ[mySeat] && occ[mySeat] !== R.id) { setMySeat(-1); upd({ seat: null }); flash('Chỗ này vừa có người ngồi trước, bạn chọn chỗ khác nhé.'); }
    Object.keys(peers).forEach((k) => { if (k !== R.id && !R.pcs[k] && peers[k].rtc && R.id < k && window.RTCPeerConnection) call(k); });
    Object.keys(R.pcs).forEach((k) => { if (!peers[k]) { closePc(R.pcs[k]); delete R.pcs[k]; } });
  }, [peers]);

  useEffect(() => { const b = box.current; if (b) b.scrollTop = b.scrollHeight; }, [msgs, chatOpen]);

  const sit = (i) => { if (!R.ch) return flash('Chưa kết nối được phòng.'); if (occ[i] && occ[i] !== R.id) return; setMySeat(i); upd({ seat: i }); };
  const stand = () => { setMySeat(-1); upd({ seat: null }); };
  const enter = () => {
    const n = name.trim(); if (!n) return;
    setName(n); ls('xmas_name', n); ls('xmas_av', av); setJoined(true); if (window.innerWidth > 1000) setChatOpen(true);
  };
  const post = (e) => {
    e.preventDefault(); const t = text.trim(); if (!t) return; setText('');
    const sb = getSupabase();
    if (!sb) return flash('Chưa cấu hình kết nối tin nhắn.');
    sb.from('messages').insert({ name, av, uid: R.uid, text: t.slice(0, 500) })
      .then(({ error }) => error && flash('Không gửi được tin nhắn. Hãy thử lại nhé.'))
      .catch(() => flash('Kết nối đang không ổn định. Hãy thử lại sau.'));
  };
  const online = Object.values(peers).filter((p) => p.rtc).length;

  const seatLabels = ['Gần lò sưởi', 'Ghế nhung đỏ', 'Bên cửa sổ', 'Sofa trái', 'Sofa phải', 'Góc ấm áp', 'Trung tâm', 'Gần cây thông'];

  return (
    <>
      <main className={'christmas-app' + (treeOff ? ' lights-muted' : '')}>
        <div className="room-backdrop" role="img" aria-label="Phòng khách được trang trí cây thông và lò sưởi Giáng sinh" />
        <div className="backdrop-shade" />
        <div className="snowfall" aria-hidden="true" />

        <header className="site-header">
          <div className="brand-lockup" aria-label="Merry Christmas">
            <span className="brand-seal">✦</span>
            <span className="brand-name">
              <strong>MERRY CHRISTMAS</strong>
              <small>THE CHRISTMAS LIVING ROOM</small>
            </span>
          </div>
          <div className="header-right">
            <span className="header-decoration" aria-hidden="true">✧</span>
            <div className="live-counter"><span className="live-dot" /> {online} người đang ở đây</div>
          </div>
        </header>

        <section className="hero" aria-label="Lời chúc Giáng sinh">
          <div className="hero-kicker">THE MOST WONDERFUL TIME OF THE YEAR</div>
          <h1><span>Merry</span><span>Christmas</span></h1>
          <p>Một chút ấm áp, một chút yêu thương <span className="hero-sparkle">✦</span> Cùng nhau tạo nên mùa Giáng sinh đáng nhớ.</p>
        </section>

        <section className="guest-panel" aria-label="Chọn chỗ ngồi">
          <div className="panel-heading">
            <div className="panel-title">
              <span className="panel-eyebrow">TAKE A SEAT · FEEL AT HOME</span>
              <h2>Quây quần bên lò sưởi</h2>
            </div>
            <div className="seat-legend">
              <span className="legend-item"><i className="legend-dot" /> Còn trống</span>
              <span className="legend-item"><i className="legend-dot occupied" /> Đang ngồi</span>
            </div>
          </div>
          <div className="seat-grid">
            {Array.from({ length: SEAT_COUNT }, (_, i) => {
              const k = occ[i], p = k && peers[k], me = k === R.id;
              const occupiedByOther = Boolean(k && !me);
              const displayName = String(p?.name || (me ? name : 'Khách')).slice(0, 14);
              return (
                <button
                  key={i}
                  type="button"
                  className={'seat-card' + (me ? ' is-mine' : '') + (occupiedByOther ? ' is-occupied' : '')}
                  onClick={() => sit(i)}
                  disabled={occupiedByOther}
                  aria-label={occupiedByOther ? `${seatLabels[i]} đã có người ngồi` : me ? `Bạn đang ngồi ${seatLabels[i]}` : `Chọn ${seatLabels[i]}`}
                  title={occupiedByOther ? `${displayName} đang ngồi` : `Chọn ${seatLabels[i]}`}
                >
                  <span className="seat-avatar">{p?.av || (me ? av : '＋')}</span>
                  <span className="seat-copy">
                    <small>{p ? (me ? 'CHỖ CỦA BẠN' : 'ĐANG CÓ KHÁCH') : 'CHỖ TRỐNG'}</small>
                    <strong>{p ? displayName : seatLabels[i]}</strong>
                  </span>
                  {p?.mic && <span className="seat-mic" title="Micro đang bật">🎙</span>}
                  <span className="seat-index">0{i + 1}</span>
                </button>
              );
            })}
          </div>
        </section>

        <nav className="control-dock" aria-label="Điều khiển phòng">
          <button className={'action-btn' + (micOn === true ? ' mic-on' : micOn === false ? ' mic-off' : ' primary')} onClick={toggleMic} type="button">
            <span className="btn-icon">{micOn === false ? '🔇' : '🎙️'}</span>
            {micOn === null ? 'Bật micro' : micOn ? 'Đang bật mic' : 'Đã tắt mic'}
          </button>
          {mySeat >= 0 && <button className="action-btn" onClick={stand} type="button"><span className="btn-icon">🪑</span> Đứng dậy</button>}
          <button className={'action-btn' + (treeOff ? '' : ' selected')} onClick={() => setTreeOff((v) => !v)} type="button"><span className="btn-icon">✨</span> {treeOff ? 'Bật ánh đèn' : 'Đèn lung linh'}</button>
          <button className="action-btn" onClick={() => setChatOpen((v) => !v)} type="button"><span className="btn-icon">💌</span> Nhắn tin</button>
        </nav>
      </main>

      <button className={'chat-scrim' + (chatOpen ? ' show' : '')} aria-label="Đóng khung chat" onClick={() => setChatOpen(false)} tabIndex={chatOpen ? 0 : -1} />
      <aside className={'chat-drawer' + (chatOpen ? ' open' : '')} aria-label="Tin nhắn của cả nhà" aria-hidden={!chatOpen}>
        <div className="chat-header">
          <div className="chat-heading">
            <span className="chat-emblem">💌</span>
            <div><h2>Lời nhắn yêu thương</h2><p>{online} thành viên đang ở trong phòng</p></div>
          </div>
          <button className="chat-close" onClick={() => setChatOpen(false)} aria-label="Đóng" type="button">×</button>
        </div>
        <div className="chat-welcome">🎄 Hãy gửi một lời chúc nhỏ để mùa lễ hội của mọi người thêm ấm áp nhé!</div>
        <div id="msgs" ref={box}>
          {!msgs.length && <div className="empty"><span>✨</span>Chưa có lời nhắn nào.<br />Hãy là người đầu tiên gửi lời chúc Giáng sinh!</div>}
          {msgs.map((m) => (
            <div key={m.id} className={'m' + (m.uid === R.uid ? ' me' : '')}>
              <div className="av">{m.av || '🎄'}</div>
              <div className="message-content">
                <div className="b">
                  <div className="n" style={{ color: colorOf(m.name) }}>{m.name}</div>
                  <div className="t">{m.text}</div>
                  <div className="h">{new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <form className="chat-form" onSubmit={post} autoComplete="off">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Viết lời chúc của bạn…" maxLength={500} aria-label="Nội dung tin nhắn" />
          <button className="send-btn" type="submit" aria-label="Gửi tin nhắn">Gửi ↗</button>
        </form>
      </aside>

      {note && <div className="toast" role="status">{note}</div>}
      <div ref={audios} className="audio-bin" />

      {!joined && (
        <div className="join-overlay">
          <div className="join-card">
            <div className="join-ornament">🎅</div>
            <span className="join-kicker">WELCOME TO OUR HOME</span>
            <h1>Merry Christmas!</h1>
            <p>Chọn một hình đại diện và tên thân thương của bạn. Cả nhà đang chờ bạn bên lò sưởi ấm áp!</p>
            <span className="avatar-label">Chọn nhân vật của bạn</span>
            <div className="avs">{AVS.map((a) => <button key={a} type="button" className={a === av ? 'on' : ''} onClick={() => setAv(a)} aria-label={`Chọn ${a}`} aria-pressed={a === av}>{a}</button>)}</div>
            <form className="join-form" onSubmit={(e) => { e.preventDefault(); enter(); }}>
              <input className="name-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên của bạn…" maxLength={16} aria-label="Tên hiển thị" />
              <button className="join-submit" type="submit">Vào phòng ✨</button>
            </form>
            <small className="join-footnote">A SEASON OF LOVE · JOY · TOGETHERNESS</small>
          </div>
        </div>
      )}
    </>
  );
}
