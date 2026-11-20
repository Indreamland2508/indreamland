'use client';
import { useEffect, useRef, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import SCENE from './sceneMarkup';

const AVS = ['🎅', '🤶', '🦌', '⛄', '🧝', '🐻', '🐱', '🎁'];
const COLS = ['#ffb86b', '#8fd6a8', '#9cc9ff', '#ff9ec0', '#e6c3ff', '#fff08a'];
const SEATS = [[400, 432], [500, 432], [600, 432], [274, 486], [726, 486], [390, 586], [500, 598], [610, 586]];
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
    getSupabase().from('messages').insert({ name, av, uid: R.uid, text: t.slice(0, 500) }).then(({ error }) => error && flash('Không gửi được tin nhắn.'));
  };
  const online = Object.values(peers).filter((p) => p.rtc).length;

  return (
    <>
      <div className="stage">
        <div className="top"><div className="ti">Phòng khách Giáng sinh</div><div className="cnt">🏠 {online} người</div></div>
        <div className="scenewrap" onClick={(e) => e.target.closest && e.target.closest('#tree') && setTreeOff((v) => !v)}>
          <div className={'scene' + (treeOff ? ' off' : '')} dangerouslySetInnerHTML={{ __html: SCENE }} />
          <svg className="seatsvg" viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice">
            {SEATS.map(([x, y], i) => {
              const k = occ[i], p = k && peers[k], me = k === R.id, sp = p && p.speak && p.mic, nm = String(p?.name || 'Khách').slice(0, 16), w = nm.length * 7.4 + 14;
              return (
                <g key={i} className="seat" onClick={() => sit(i)}>
                  {!p ? (<g className="free"><circle cx={x} cy={y} r="22" fill="#0004" stroke="#fff3e0" strokeWidth="2" strokeDasharray="5 4" /><text x={x} y={y + 7} textAnchor="middle" fontSize="22" fill="#fff3e0">+</text></g>) : (<>
                    <circle cx={x} cy={y} r="26" fill="#3a2a20" stroke={sp ? '#5dff9a' : '#ffcf6b'} strokeWidth={sp ? 5 : 3} className={sp ? 'spk' : ''} />
                    <text x={x} y={y + 10} textAnchor="middle" fontSize="28">{p.av || '🙂'}</text>
                    <rect x={x - w / 2} y={y + 30} width={w} height="17" rx="8.5" fill="#000b" />
                    <text x={x} y={y + 43} textAnchor="middle" fontSize="11" fill={me ? '#ffcf6b' : '#fff3e0'}>{nm}</text>
                    {p.mic && <text x={x + 20} y={y - 16} fontSize="14" textAnchor="middle">🎙️</text>}
                  </>)}
                </g>
              );
            })}
          </svg>
        </div>
        {joined && mySeat < 0 && <div className="hint">Bấm vào một chỗ ngồi trống để vào ngồi 🪑</div>}
        <div className="bar">
          <button className={micOn === null ? '' : micOn ? 'on' : 'warn'} onClick={toggleMic}>{micOn === null ? '🎙️ Bật mic' : micOn ? '🎙️ Đang nói (bấm để tắt)' : '🔇 Đã tắt mic'}</button>
          {mySeat >= 0 && <button onClick={stand}>🧍 Đứng dậy</button>}
          <button onClick={() => setChatOpen((v) => !v)}>💬 Nhắn tin</button>
        </div>
      </div>

      <aside className={'chat' + (chatOpen ? ' open' : '')}>
        <h2>🔥 Tin nhắn của cả nhà <button onClick={() => setChatOpen(false)} aria-label="Đóng">✕</button></h2>
        <div id="msgs" ref={box}>
          {!msgs.length && <div className="empty">Chưa có tin nhắn nào. Hãy gửi lời chúc đầu tiên nhé 🎄</div>}
          {msgs.map((m) => (
            <div key={m.id} className={'m' + (m.uid === R.uid ? ' me' : '')}>
              <div className="av">{m.av || '🎄'}</div>
              <div className="b"><div className="n" style={{ color: colorOf(m.name) }}>{m.name}</div><div className="t">{m.text}</div>
                <div className="h">{new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div></div>
            </div>
          ))}
        </div>
        <form className="row" onSubmit={post} autoComplete="off">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nói điều gì đó với cả nhà…" maxLength={500} />
          <button className="btn" type="submit">Gửi</button>
        </form>
      </aside>

      {note && <div className="note">{note}</div>}
      <div ref={audios} className="hide" />

      {!joined && (
        <div className="join"><div className="box">
          <h1>Chào mừng về nhà 🎄</h1>
          <p>Chọn hình đại diện và tên của bạn, rồi vào ngồi cạnh lò sưởi cùng cả nhà. Bạn có thể bật mic để nói chuyện trực tiếp.</p>
          <div className="avs">{AVS.map((a) => <button key={a} type="button" className={a === av ? 'on' : ''} onClick={() => setAv(a)}>{a}</button>)}</div>
          <div className="row">
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enter()} placeholder="Tên của bạn (Mẹ, Bố, Bi…)" maxLength={16} />
            <button className="btn" onClick={enter}>Vào phòng</button>
          </div>
        </div></div>
      )}
    </>
  );
}
