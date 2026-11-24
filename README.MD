# CherismAI — Website Cung Cấp Dịch Vụ AI

## Thông tin đồ án
- **Đề tài:** Xây dựng Website cung cấp dịch vụ AI (Đồ án 2)
- **Sinh viên:** Nguyễn Anh Quân — MSV: `10124262` — Lớp: `12524W.2`
- **Trường:** Đại học Công nghệ Kỹ thuật Hưng Yên (HYUTE)
- **Công nghệ:** HTML5, CSS3, Vanilla JavaScript, LocalStorage (Static Frontend — GitHub Pages)

## Chức năng chính (Phân hệ Khách hàng)
- **Trang chủ (`src/views/index.html`):** Danh mục dịch vụ AI (Tài khoản cấp sẵn, Nâng cấp chính chủ, API Key), tìm kiếm, lọc theo danh mục/hình thức/khoảng giá, sắp xếp theo giá, chọn thời hạn hoặc hạn mức Token, mua ngay và đánh giá sản phẩm.
- **Tài khoản (`src/views/auth/`, `profile.html`):** Đăng ký, đăng nhập, quên mật khẩu, cập nhật hồ sơ cá nhân, đổi mật khẩu.
- **Giỏ hàng & Thanh toán (`src/views/cart.html`):** Cập nhật số lượng, áp dụng mã giảm giá (`SINHVIEN10`, `CHERISMAI20K`), tạo đơn hàng với chuyển khoản MB Bank hoặc quét mã VietQR mô phỏng.
- **Đơn hàng, Thanh toán & Bảo hành (`order_history.html`, `payment_history.html`, `warranty.html`):** Tra cứu chi tiết đơn hàng, nhận thông tin bàn giao (Tài khoản / Email nâng cấp / Base URL + API Key), đối soát giao dịch, gửi và theo dõi phiếu bảo hành.
- **Chính sách (`src/views/policy/`):** Điều khoản dịch vụ, chính sách bảo mật và chính sách hoàn tiền.

## Tài khoản thử nghiệm
- **Khách hàng:** `user01` / Mật khẩu: `12345678`
- **Quản trị:** `admin01` / Mật khẩu: `12345678`

## Cấu trúc thư mục
```
├── index.html            # Chuyển hướng vào src/views/index.html (GitHub Pages)
├── docs/                 # Tài liệu phân tích, biểu đồ, sitemap & wireframe
└── src/
    ├── public/
    │   ├── css/          # Giao diện tách riêng theo từng phân hệ
    │   └── js/           # Xử lý logic & khởi tạo dữ liệu LocalStorage (load_data.js)
    └── views/            # Các trang HTML phía khách hàng
```

## Preview
Nhấn vào đây để chuyển hướng tới <a href="src/views/index.html">CherismAI</a>