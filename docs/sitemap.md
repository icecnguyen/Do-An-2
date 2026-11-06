# MẪU SITEMAP – WEBSITE CUNG CẤP DỊCH VỤ AI (CherismAI)
*Ví dụ tham khảo cho Đồ án Thiết kế Web cơ bản / Đồ án 2*

## SITEMAP PHÂN HỆ NGƯỜI DÙNG (USER SITEMAP)

```
                                  [TRANG CHỦ]
                               (views/index.html)
                                       │
     ┌──────────────────┬──────────────┼──────────────┬──────────────────┐
     │                  │              │              │                  │
     ▼                  ▼              ▼              ▼                  ▼
[DỊCH VỤ AI]       [GIỎ HÀNG]     [TÀI KHOẢN]    [LỊCH SỬ]          [CHÍNH SÁCH]
     │                  │              │              │                  │
     ├─ Tạo văn bản     ├─ Xem giỏ     ├─ Đăng nhập   ├─ Đơn hàng        ├─ Điều khoản
     │  (ChatGPT, Claude│  (cart.html) │  (login.html)│  (order_history) │  (term.html)
     │                  │              │              │                  │
     ├─ Tạo ảnh & Video └─ Xác nhận    ├─ Đăng ký     └─ Thanh toán      ├─ Bảo mật
     │  (Midjourney...)    tạo đơn     │(register.html   (payment_history│  (privacy.html)
     │                                 │                                 │
     ├─ Lập trình & Code               ├─ Đổi mật khẩu                   └─ Hoàn tiền
     │  (Copilot, DeepS)               │  (change.html)                     (refund.html)
     │                                 │
     └─ Chi tiết gói AI                └─ Hồ sơ cá nhân
        (Modal chi tiết)                  (profile.html)
```

---

### Gợi ý cho sinh viên:
- **Xác định nhóm người dùng:** Khách vãng lai (Guest) và Người dùng đăng nhập (User).
- **Phân định rõ ràng:** Các trang độc lập (11 tệp HTML) và thành phần mở rộng tại chỗ (Modal chi tiết dịch vụ).
- **Điều hướng hai chiều:** Mọi trang đều liên kết chặt chẽ qua Header, Footer và Breadcrumb, đảm bảo không có trang bị cô lập ("mồ côi").

