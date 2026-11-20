# Phòng khách Giáng sinh (Next.js + Supabase)

Phòng khách trực tuyến: chọn chỗ ngồi, nói chuyện bằng mic (WebRTC) và nhắn tin.

## 1. Tạo Supabase (miễn phí)
1. Vào https://supabase.com, tạo project mới.
2. Vào **SQL Editor**, dán nội dung `supabase.sql` rồi chạy (tạo bảng tin nhắn và bật realtime).
3. Vào **Project Settings > API**, lấy `Project URL` và `anon public key`.

## 2. Chạy thử trên máy
```bash
cp .env.example .env.local   # điền URL và anon key
npm install
npm run dev                   # mở http://localhost:3000
```

## 3. Đưa lên Vercel
1. Đẩy thư mục này lên GitHub.
2. Trên https://vercel.com chọn **Add New > Project**, import repo (Vercel tự nhận Next.js).
3. Ở mục **Environment Variables**, thêm các biến trong `.env.example`.
4. Bấm **Deploy**. Trang chạy bằng https nên trình duyệt cho phép dùng micro.

## 4. Giọng nói ổn định hơn (nên làm)
Giọng nói đi trực tiếp giữa các máy. Một số mạng (4G, công ty) chặn kết nối này nên cần TURN server.
Đăng ký gói miễn phí của Metered (metered.ca) hoặc Cloudflare Calls, rồi điền `NEXT_PUBLIC_TURN_URL`,
`NEXT_PUBLIC_TURN_USERNAME`, `NEXT_PUBLIC_TURN_CREDENTIAL` trên Vercel và deploy lại.
Cách này phù hợp nhóm nhỏ (khoảng 8 người, đúng bằng số ghế). Nhóm lớn hơn nên dùng SFU như LiveKit.

## Cấu trúc
- `components/Room.js`: logic phòng, chỗ ngồi, mic, chat
- `components/sceneMarkup.js`: hình phòng khách (SVG)
- `supabase.sql`: bảng tin nhắn
