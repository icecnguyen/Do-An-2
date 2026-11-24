const DEFAULT_DATA = {
    services: [
        {
            serviceId: "SRV_GPT_01",
            serviceName: "ChatGPT Plus (Nâng cấp chính chủ)",
            category: "TEXT",
            categoryLabel: "Tạo văn bản",
            productType: "UPGRADE_OWN",
            productTypeLabel: "Nâng cấp chính chủ",
            thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
            iconClass: "fa-solid fa-message",
            iconColor: "#059669",
            iconBg: "#ecfdf5",
            description: "Nâng cấp trực tiếp lên tài khoản OpenAI của bạn. Truy cập GPT-4o tốc độ cao và DALL-E 3.",
            price: 199000,
            planDuration: "30 ngày",
            detailedInfo: "Kích hoạt trực tiếp trên email OpenAI cá nhân của khách hàng. Toàn bộ lịch sử chat được giữ nguyên, bảo hành 1 đổi 1 suốt thời hạn."
        },
        {
            serviceId: "SRV_CLAUDE_01",
            serviceName: "Claude 3.5 Sonnet Pro (Tài khoản riêng)",
            category: "TEXT",
            categoryLabel: "Tạo văn bản",
            productType: "PRE_ACCOUNT",
            productTypeLabel: "Tài khoản cấp sẵn",
            thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
            iconClass: "fa-solid fa-brain",
            iconColor: "#d97706",
            iconBg: "#fffbeb",
            description: "Tài khoản Claude Pro cấp sẵn dùng riêng, ngữ cảnh 200K token, hỗ trợ viết lách và Artifacts.",
            price: 249000,
            planDuration: "30 ngày",
            detailedInfo: "Bàn giao tài khoản và mật khẩu đăng nhập riêng ngay sau khi thanh toán. Sử dụng đầy đủ Claude 3.5 Sonnet và Claude 3 Opus."
        },
        {
            serviceId: "SRV_MID_01",
            serviceName: "Midjourney Standard (Tài khoản sẵn)",
            category: "IMAGE",
            categoryLabel: "Tạo ảnh & Video",
            productType: "PRE_ACCOUNT",
            productTypeLabel: "Tài khoản cấp sẵn",
            thumbnailUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80",
            iconClass: "fa-solid fa-palette",
            iconColor: "#7c3aed",
            iconBg: "#f5f3ff",
            description: "Tài khoản Discord kích hoạt sẵn gói Midjourney Standard với 15h GPU Fast/tháng và Relax không giới hạn.",
            price: 299000,
            planDuration: "30 ngày",
            detailedInfo: "Cấp sẵn tài khoản Discord đã đăng ký gói Standard. Hỗ trợ tạo ảnh độ phân giải cao và chế độ Relax không giới hạn."
        },
        {
            serviceId: "SRV_COP_01",
            serviceName: "GitHub Copilot (Nâng cấp tài khoản)",
            category: "CODE",
            categoryLabel: "Lập trình",
            productType: "UPGRADE_OWN",
            productTypeLabel: "Nâng cấp chính chủ",
            thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
            iconClass: "fa-brands fa-github",
            iconColor: "#0f172a",
            iconBg: "#f1f5f9",
            description: "Kích hoạt Copilot Pro trực tiếp trên GitHub cá nhân, gợi ý mã nguồn trên VS Code và JetBrains.",
            price: 99000,
            planDuration: "30 ngày",
            detailedInfo: "Khách hàng cung cấp email GitHub khi đặt hàng để nhận lời mời kích hoạt chính chủ, không cần chia sẻ mật khẩu."
        },
        {
            serviceId: "SRV_CANVA_01",
            serviceName: "Canva Pro (Nâng cấp chính chủ)",
            category: "IMAGE",
            categoryLabel: "Tạo ảnh & Video",
            productType: "UPGRADE_OWN",
            productTypeLabel: "Nâng cấp chính chủ",
            thumbnailUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80",
            iconClass: "fa-solid fa-pen-nib",
            iconColor: "#0d9488",
            iconBg: "#f0fdfa",
            description: "Nâng cấp Canva Pro chính chủ trên email của bạn, mở khóa kho mẫu thiết kế và xóa nền AI.",
            price: 79000,
            planDuration: "1 năm",
            detailedInfo: "Gửi lời mời tham gia nhóm bản quyền trực tiếp vào email Canva của khách hàng. Lưu trữ đám mây 100GB."
        },
        {
            serviceId: "SRV_DEEP_01",
            serviceName: "DeepSeek API Key Quota",
            category: "CODE",
            categoryLabel: "Lập trình",
            productType: "API_KEY",
            productTypeLabel: "API Key",
            thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
            iconClass: "fa-solid fa-key",
            iconColor: "#2563eb",
            iconBg: "#eff6ff",
            description: "Cấp mã API Key DeepSeek-V3 và DeepSeek-R1 chuẩn OpenAI phục vụ tích hợp ứng dụng và nghiên cứu.",
            price: 150000,
            planDuration: "20M tokens",
            apiEndpoint: "https://api.deepseek.com/v1",
            detailedInfo: "Bàn giao mã API Key riêng kèm Endpoint ngay trong chi tiết đơn hàng. Không giới hạn thời gian sử dụng cho đến khi hết hạn mức."
        },
        {
            serviceId: "SRV_OPENAI_API_01",
            serviceName: "OpenAI API Key Quota (GPT-4o)",
            category: "CODE",
            categoryLabel: "Lập trình",
            productType: "API_KEY",
            productTypeLabel: "API Key",
            thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80",
            iconClass: "fa-solid fa-terminal",
            iconColor: "#4f46e5",
            iconBg: "#eef2ff",
            description: "Cung cấp API Key OpenAI Tier cao hỗ trợ GPT-4o, GPT-4o-mini và Embeddings cho đồ án, ứng dụng.",
            price: 220000,
            planDuration: "10M tokens",
            apiEndpoint: "https://api.cherismai.vn/v1",
            detailedInfo: "Cấp mã API Key dạng sk-... kèm Base URL và hạn mức sử dụng tương ứng. Hỗ trợ xuất hóa đơn đối soát và bảo hành lỗi key."
        }
    ],
    categories: [
        { id: "ALL", name: "Tất cả" },
        { id: "TEXT", name: "Tạo văn bản" },
        { id: "IMAGE", name: "Tạo ảnh & Video" },
        { id: "CODE", name: "Lập trình & Code" }
    ],
    accounts: [
        {
            uid: "usr01",
            email: "example@gmail.com",
            username: "admin01",
            password: "12345678",
            role: "admin",
            created_at: "2026-09-19 09:49:06",
            updated_at: "2026-09-19 09:49:06"
        },
        {
            uid: "usr02",
            email: "example1@gmail.com",
            username: "user01",
            password: "12345678",
            role: "user",
            created_at: "2026-09-19 09:49:06",
            updated_at: "2026-09-19 09:49:06"
        }
    ],
    orders: [
        {
            orderId: "ORD-20260919-01",
            uid: "usr02",
            username: "user01",
            receiverName: "Nguyễn Anh Quân",
            receiverEmail: "example1@gmail.com",
            paymentMethod: "Chuyển khoản ngân hàng (MB Bank)",
            note: "Kích hoạt giúp mình trên email đăng ký.",
            items: [
                {
                    serviceId: "SRV_GPT_01",
                    serviceName: "ChatGPT Plus (Nâng cấp chính chủ)",
                    productType: "UPGRADE_OWN",
                    productTypeLabel: "Nâng cấp chính chủ",
                    planDuration: "30 ngày",
                    price: 199000,
                    quantity: 1
                }
            ],
            totalAmount: 199000,
            status: "completed",
            statusLabel: "Đã cấp tài khoản",
            deliveredAccount: "• ChatGPT Plus (Nâng cấp chính chủ): Đã gửi lời mời nâng cấp chính chủ tới example1@gmail.com (30 ngày)",
            createdAt: "19/09/2026 10:15"
        },
        {
            orderId: "ORD-20260920-02",
            uid: "usr02",
            username: "user01",
            receiverName: "Nguyễn Anh Quân",
            receiverEmail: "example1@gmail.com",
            paymentMethod: "Quét mã QR (VietQR)",
            note: "Cần dùng gấp cho đồ án cuối kỳ.",
            items: [
                {
                    serviceId: "SRV_CLAUDE_01",
                    serviceName: "Claude 3.5 Sonnet Pro (Tài khoản riêng)",
                    productType: "PRE_ACCOUNT",
                    productTypeLabel: "Tài khoản cấp sẵn",
                    planDuration: "30 ngày",
                    price: 249000,
                    quantity: 1
                },
                {
                    serviceId: "SRV_COP_01",
                    serviceName: "GitHub Copilot (Nâng cấp tài khoản)",
                    productType: "UPGRADE_OWN",
                    productTypeLabel: "Nâng cấp chính chủ",
                    planDuration: "30 ngày",
                    price: 99000,
                    quantity: 1
                }
            ],
            totalAmount: 348000,
            status: "pending",
            statusLabel: "Chờ xử lý",
            deliveredAccount: "",
            createdAt: "20/09/2026 14:30"
        },
        {
            orderId: "ORD-20260921-03",
            uid: "usr02",
            username: "user01",
            receiverName: "Nguyễn Anh Quân",
            receiverEmail: "example1@gmail.com",
            paymentMethod: "Quét mã QR (VietQR)",
            note: "Lấy API Key tích hợp vào bài tập lớn.",
            items: [
                {
                    serviceId: "SRV_DEEP_01",
                    serviceName: "DeepSeek API Key Quota",
                    productType: "API_KEY",
                    productTypeLabel: "API Key",
                    apiEndpoint: "https://api.deepseek.com/v1",
                    planDuration: "20M tokens",
                    price: 150000,
                    quantity: 1
                }
            ],
            totalAmount: 150000,
            status: "completed",
            statusLabel: "Đã cấp tài khoản",
            deliveredAccount: "• DeepSeek API Key Quota: Base URL: https://api.deepseek.com/v1 | API Key: sk-cherismai-2103k9x2m (Hạn mức: 20M tokens)",
            createdAt: "21/09/2026 08:45"
        }
    ],
    payments: [
        {
            transactionId: "TXN-884102",
            orderId: "ORD-20260919-01",
            uid: "usr02",
            username: "user01",
            amount: 199000,
            method: "Chuyển khoản ngân hàng (MB Bank)",
            status: "success",
            statusLabel: "Thành công",
            createdAt: "19/09/2026 10:16"
        },
        {
            transactionId: "TXN-884215",
            orderId: "ORD-20260920-02",
            uid: "usr02",
            username: "user01",
            amount: 348000,
            method: "Quét mã QR (VietQR)",
            status: "pending",
            statusLabel: "Chờ xác nhận",
            createdAt: "20/09/2026 14:31"
        },
        {
            transactionId: "TXN-884390",
            orderId: "ORD-20260921-03",
            uid: "usr02",
            username: "user01",
            amount: 150000,
            method: "Quét mã QR (VietQR)",
            status: "success",
            statusLabel: "Thành công",
            createdAt: "21/09/2026 08:46"
        }
    ],
    reviews: [
        {
            reviewId: "REV-001",
            serviceId: "SRV_GPT_01",
            uid: "usr02",
            username: "user01",
            rating: 5,
            comment: "Tài khoản kích hoạt nhanh, dùng GPT-4o rất ổn định để hỗ trợ làm đồ án.",
            createdAt: "19/09/2026"
        },
        {
            reviewId: "REV-002",
            serviceId: "SRV_CLAUDE_01",
            uid: "usr02",
            username: "user01",
            rating: 5,
            comment: "Claude 3.5 Sonnet viết code và phân tích tài liệu dài cực kỳ chính xác.",
            createdAt: "20/09/2026"
        },
        {
            reviewId: "REV-003",
            serviceId: "SRV_COP_01",
            uid: "usr01",
            username: "admin01",
            rating: 4,
            comment: "Gợi ý code trên VS Code mượt, tiết kiệm nhiều thời gian.",
            createdAt: "21/09/2026"
        }
    ],
    warranties: [
        {
            ticketId: "BH-20260921-01",
            orderId: "ORD-20260919-01",
            uid: "usr02",
            username: "user01",
            issueType: "Lỗi đăng nhập / sai mật khẩu (Tài khoản cấp sẵn)",
            description: "Tài khoản báo cần xác minh lại phiên đăng nhập trên trình duyệt mới.",
            evidenceImage: "",
            ticketStatus: "resolved",
            statusLabel: "Đã xử lý",
            staffNote: "Đã gửi mã xác minh và cấp lại phiên đăng nhập mới qua email cho bạn.",
            createdAt: "21/09/2026 09:20"
        }
    ]
};

function ensureStorageSeed(storageKey, defaultArray, forceReload = false) {
    if (!forceReload) {
        const existing = localStorage.getItem(storageKey);
        if (existing) {
            try {
                const parsed = JSON.parse(existing);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (e) {
                console.warn(`Lỗi đọc ${storageKey}, tiến hành khôi phục dữ liệu mẫu:`, e);
            }
        }
    }
    localStorage.setItem(storageKey, JSON.stringify(defaultArray));
    return defaultArray;
}

function readStorageArray(storageKey) {
    try {
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

const DataLoader = {
    async initData(forceReload = false) {
        if (!localStorage.getItem("ai_cart")) {
            localStorage.setItem("ai_cart", JSON.stringify([]));
        }
        return ensureStorageSeed("ai_services", DEFAULT_DATA.services, forceReload);
    },

    async initCategories(forceReload = false) {
        return ensureStorageSeed("ai_categories", DEFAULT_DATA.categories, forceReload);
    },

    async initAccounts(forceReload = false) {
        return ensureStorageSeed("ai_accounts", DEFAULT_DATA.accounts, forceReload);
    },

    async initOrders(forceReload = false) {
        return ensureStorageSeed("ai_orders", DEFAULT_DATA.orders, forceReload);
    },

    async initPayments(forceReload = false) {
        return ensureStorageSeed("ai_payments", DEFAULT_DATA.payments, forceReload);
    },

    async initReviews(forceReload = false) {
        return ensureStorageSeed("ai_reviews", DEFAULT_DATA.reviews, forceReload);
    },

    async initWarranties(forceReload = false) {
        return ensureStorageSeed("ai_warranties", DEFAULT_DATA.warranties, forceReload);
    },

    getServices() {
        return readStorageArray("ai_services");
    },

    getServiceById(id) {
        return this.getServices().find(s => s.serviceId === id) || null;
    },

    getCategories() {
        return readStorageArray("ai_categories");
    },

    getAccounts() {
        return readStorageArray("ai_accounts");
    },

    getCurrentUser() {
        try {
            const data = localStorage.getItem("currentUser");
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    getOrders() {
        return readStorageArray("ai_orders");
    },

    getPayments() {
        return readStorageArray("ai_payments");
    },

    getReviews() {
        return readStorageArray("ai_reviews");
    },

    getWarranties() {
        return readStorageArray("ai_warranties");
    },

    async resetAllData() {
        await this.initData(true);
        await this.initCategories(true);
        await this.initAccounts(true);
        await this.initOrders(true);
        await this.initPayments(true);
        await this.initReviews(true);
        await this.initWarranties(true);
        localStorage.setItem("ai_cart", JSON.stringify([]));
    }
};

window.DataLoader = DataLoader;