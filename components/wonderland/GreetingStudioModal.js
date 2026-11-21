'use client';

import { useEffect, useState } from 'react';

const presets = [
  { id: 'noel', label: 'Noël Rouge', swatch: '#7b2632', className: 'card-noel', colors: ['#260812', '#81263b', '#f0cf91'] },
  { id: 'rose', label: 'Velvet Rose', swatch: '#a34b5d', className: 'card-rose', colors: ['#3a0c1c', '#a34b5d', '#f6d9b0'] },
  { id: 'midnight', label: 'Midnight Gold', swatch: '#25334c', className: 'card-midnight', colors: ['#0d1728', '#293a55', '#e8ca8b'] },
];

const ornaments = [
  { id: 'snow', label: 'Bông tuyết', mark: '❄' },
  { id: 'star', label: 'Ngôi sao', mark: '✦' },
  { id: 'holly', label: 'Lá mùa đông', mark: '❋' },
];

const messageIdeas = [
  'Chúc bạn một mùa Giáng sinh thật ấm áp, bình yên và đầy ắp những điều kỳ diệu.',
  'Mong những điều dịu dàng nhất sẽ tìm đến bạn trong mùa lễ hội này.',
  'Cảm ơn vì đã đồng hành. Chúc chúng ta có thêm thật nhiều kỷ niệm đẹp.',
];

function wrapCanvasText(ctx, text, maxWidth) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines;
}

export default function GreetingStudioModal({ open, onClose }) {
  const [sender, setSender] = useState('Một người bạn');
  const [recipient, setRecipient] = useState('Bạn thân mến');
  const [message, setMessage] = useState(messageIdeas[0]);
  const [preset, setPreset] = useState('noel');
  const [ornament, setOrnament] = useState('snow');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const selectedPreset = presets.find((item) => item.id === preset) || presets[0];
  const selectedOrnament = ornaments.find((item) => item.id === ornament) || ornaments[0];

  const downloadCard = async () => {
    try {
      if (document.fonts?.load) {
        await Promise.all([
          document.fonts.load('400 35px "Be Vietnam Pro"'),
          document.fonts.load('600 43px "Be Vietnam Pro"'),
          document.fonts.load('italic 116px Georgia'),
        ]);
      } else if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1100;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas không khả dụng');

      const [deep, bright, gold] = selectedPreset.colors;
      const gradient = ctx.createLinearGradient(0, 0, 1600, 1100);
      gradient.addColorStop(0, bright);
      gradient.addColorStop(.52, deep);
      gradient.addColorStop(1, '#16050d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1600, 1100);

      const glow = ctx.createRadialGradient(800, 330, 30, 800, 330, 720);
      glow.addColorStop(0, 'rgba(235,174,111,.22)');
      glow.addColorStop(1, 'rgba(235,174,111,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1600, 1100);

      ctx.strokeStyle = gold;
      ctx.lineWidth = 3;
      ctx.strokeRect(46, 46, 1508, 1008);
      ctx.strokeStyle = 'rgba(255,226,177,.42)';
      ctx.lineWidth = 1;
      ctx.strokeRect(68, 68, 1464, 964);

      // Fine, deterministic snow and warm light specks.
      for (let index = 0; index < 130; index += 1) {
        const x = (index * 197 + 83) % 1600;
        const y = (index * 131 + 41) % 1100;
        const radius = index % 11 === 0 ? 5 : index % 4 === 0 ? 3 : 1.7;
        ctx.globalAlpha = .18 + ((index % 5) * .07);
        ctx.fillStyle = index % 6 === 0 ? '#f0bd78' : '#fff2d9';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.textAlign = 'center';
      ctx.fillStyle = gold;
      ctx.font = '600 29px "Be Vietnam Pro", Arial, sans-serif';
      ctx.fillText('A LITTLE CHRISTMAS MAGIC', 800, 224);
      ctx.font = '64px Georgia, serif';
      ctx.fillText(selectedOrnament.mark, 800, 330);
      ctx.fillStyle = '#fff4e6';
      ctx.font = 'italic 116px Georgia, serif';
      ctx.fillText('Merry Christmas', 800, 455);
      ctx.fillStyle = '#f6dfb9';
      ctx.font = '600 43px "Be Vietnam Pro", "Segoe UI", Arial, sans-serif';
      ctx.fillText(`Gửi ${recipient.trim() || 'bạn thân mến'},`, 800, 570, 1220);

      ctx.font = '400 35px "Be Vietnam Pro", "Segoe UI", Arial, sans-serif';
      const lines = wrapCanvasText(ctx, message || 'Chúc bạn một mùa Giáng sinh an lành.', 1120).slice(0, 4);
      lines.forEach((line, index) => {
        ctx.fillStyle = '#fff4e8';
        ctx.fillText(line, 800, 658 + index * 57, 1160);
      });

      ctx.fillStyle = gold;
      ctx.font = 'italic 700 38px "Be Vietnam Pro", "Segoe UI", Arial, sans-serif';
      ctx.fillText(`With love, ${sender.trim() || 'Một người bạn'}`, 800, 920, 1300);
      ctx.fillStyle = 'rgba(255,239,214,.74)';
      ctx.font = '600 23px "Be Vietnam Pro", Arial, sans-serif';
      ctx.fillText('CHRISTMAS WONDERLAND', 800, 982);

      const link = document.createElement('a');
      link.download = 'christmas-wonderland-greeting.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      setNotice('Thiệp PNG đã được tạo và tải xuống.');
    } catch {
      setNotice('Chưa thể tạo ảnh thiệp trên trình duyệt này. Hãy thử lại bằng Chrome hoặc Edge.');
    }
  };

  const copyGreeting = async () => {
    const value = `Gửi ${recipient.trim() || 'bạn thân mến'}: ${message.trim()} — ${sender.trim() || 'Một người bạn'}`;
    try {
      await navigator.clipboard.writeText(value);
      setNotice('Đã sao chép lời chúc.');
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = value;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      const copied = document.execCommand('copy');
      fallback.remove();
      setNotice(copied ? 'Đã sao chép lời chúc.' : 'Trình duyệt không cho phép sao chép tự động.');
    }
  };

  const resetCard = () => {
    setSender('Một người bạn');
    setRecipient('Bạn thân mến');
    setMessage(messageIdeas[0]);
    setPreset('noel');
    setOrnament('snow');
    setNotice('Đã khôi phục mẫu thiệp ban đầu.');
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section className="studio-modal studio-modal-rich" role="dialog" aria-modal="true" aria-labelledby="studio-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Đóng">×</button>
        <div className="studio-intro">
          <span className="eyebrow">A GIFT FROM THE HEART</span>
          <h2 id="studio-title">Christmas <em>Card Studio</em></h2>
          <p>Tạo một tấm thiệp mang dấu ấn riêng, rồi tải về để gửi đến người bạn quý mến.</p>
        </div>

        <div className="studio-layout">
          <div className="studio-fields">
            <label>Người nhận<input value={recipient} onChange={(event) => setRecipient(event.target.value)} maxLength={36} placeholder="Tên người nhận" /></label>
            <label>Lời chúc<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={180} rows={4} placeholder="Viết điều bạn muốn gửi gắm..." /></label>
            <div className="studio-ideas">
              <span className="field-label">Gợi ý lời chúc</span>
              <div className="studio-idea-list">
                {messageIdeas.map((idea, index) => (
                  <button key={idea} type="button" className="studio-idea" onClick={() => setMessage(idea)}>Mẫu {index + 1}</button>
                ))}
              </div>
            </div>
            <label>Người gửi<input value={sender} onChange={(event) => setSender(event.target.value)} maxLength={36} placeholder="Tên của bạn" /></label>
            <div className="preset-group">
              <span className="field-label">Chọn sắc màu</span>
              <div className="preset-options">
                {presets.map((item) => (
                  <button key={item.id} type="button" className={preset === item.id ? 'preset active' : 'preset'} onClick={() => setPreset(item.id)} aria-pressed={preset === item.id}>
                    <i style={{ background: item.swatch }} />
                    <small>{item.label}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="preset-group">
              <span className="field-label">Họa tiết trang trí</span>
              <div className="ornament-options">
                {ornaments.map((item) => (
                  <button key={item.id} type="button" className={ornament === item.id ? 'ornament-choice active' : 'ornament-choice'} onClick={() => setOrnament(item.id)} aria-pressed={ornament === item.id}>
                    <span>{item.mark}</span>{item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`greeting-preview ${selectedPreset.className}`}>
            <div className="preview-frame">
              <span className="preview-kicker">A LITTLE CHRISTMAS MAGIC</span>
              <span className="preview-holly" aria-hidden="true">{selectedOrnament.mark}</span>
              <h3>Merry<br /><em>Christmas</em></h3>
              <p className="preview-recipient">Gửi {recipient || 'bạn thân mến'},</p>
              <p className="preview-message">{message || 'Chúc bạn một mùa Giáng sinh an lành.'}</p>
              <span className="preview-sign">With love, {sender || 'Một người bạn'}</span>
              <span className="preview-footer">CHRISTMAS WONDERLAND</span>
            </div>
          </div>
        </div>

        {notice && <p className="studio-notice" role="status">{notice}</p>}
        <div className="studio-actions studio-actions-rich">
          <button className="button button-quiet" type="button" onClick={resetCard}>Làm mới</button>
          <button className="button button-quiet" type="button" onClick={copyGreeting}>Sao chép lời chúc</button>
          <button className="button button-gold" type="button" onClick={downloadCard}>Tải thiệp PNG <span aria-hidden="true">↓</span></button>
        </div>
        <p className="studio-privacy-note">Thiệp được tạo ngay trên trình duyệt của bạn; nội dung không được gửi lên máy chủ.</p>
      </section>
    </div>
  );
}
