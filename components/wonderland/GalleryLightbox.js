'use client';

import { useEffect } from 'react';

const galleryItems = [
  {
    src: '/christmas-village.webp',
    alt: 'Ngôi làng Giáng sinh phủ tuyết với cây thông rực sáng và những căn nhà ấm áp',
    title: 'The Winter Village',
    caption: 'Follow the lights through a little winter wonderland.',
  },
  {
    src: '/christmas-lounge.webp',
    alt: 'Phòng khách Giáng sinh ấm cúng với lò sưởi và cây thông trang trí',
    title: 'The Cozy Night',
    caption: 'A quiet corner, a warm fire and a little time to slow down.',
  },
  {
    src: '/christmas-world-map.webp',
    alt: 'Bản đồ thế giới Giáng sinh trong đêm mùa đông',
    title: 'A Winter Postcard',
    caption: 'A tiny postcard from somewhere filled with magic.',
  },
];

export default function GalleryLightbox({ activeIndex, onChange, onClose }) {
  useEffect(() => {
    if (activeIndex === null) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'ArrowRight') onChange?.((activeIndex + 1) % galleryItems.length);
      if (event.key === 'ArrowLeft') onChange?.((activeIndex + galleryItems.length - 1) % galleryItems.length);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, onChange, onClose]);

  if (activeIndex === null) return null;
  const item = galleryItems[activeIndex] || galleryItems[0];

  return (
    <div className="gallery-lightbox" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section className="gallery-lightbox-panel" role="dialog" aria-modal="true" aria-label="Xem ảnh Giáng sinh">
        <button className="gallery-lightbox-close" type="button" onClick={onClose} aria-label="Đóng ảnh">×</button>
        <button className="gallery-lightbox-nav gallery-lightbox-prev" type="button" onClick={() => onChange?.((activeIndex + galleryItems.length - 1) % galleryItems.length)} aria-label="Ảnh trước">‹</button>
        <img src={item.src} alt={item.alt} />
        <button className="gallery-lightbox-nav gallery-lightbox-next" type="button" onClick={() => onChange?.((activeIndex + 1) % galleryItems.length)} aria-label="Ảnh tiếp theo">›</button>
        <div className="gallery-lightbox-caption">
          <span>{String(activeIndex + 1).padStart(2, '0')} / {String(galleryItems.length).padStart(2, '0')}</span>
          <strong>{item.title}</strong>
          <p>{item.caption}</p>
        </div>
      </section>
    </div>
  );
}
