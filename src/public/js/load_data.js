// ============================================================
// DỰ ÁN: CherismAI
// TỆP: load_data.js - Bộ nạp và đồng bộ dữ liệu từ JSON vào LocalStorage
// ============================================================

const DataLoader = {
    // 1. Hàm nạp sản phẩm từ products.json vào LocalStorage
    async initData(forceReload = false) {
        if (!localStorage.getItem("ai_cart")) {
            localStorage.setItem("ai_cart", JSON.stringify([]));
        }

        const existingData = localStorage.getItem("ai_services");
        if (existingData && !forceReload) {
            try {
                const parsed = JSON.parse(existingData);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].thumbnailUrl) {
                    return parsed;
                }
            } catch (e) {
                console.warn("Lỗi đọc LocalStorage, tiến hành nạp lại từ JSON:", e);
            }
        }

        try {
            const isSubFolder = window.location.pathname.includes("/auth/") || window.location.pathname.includes("/policy/");
            const jsonPath = isSubFolder ? "../../data/products.json" : "../data/products.json";

            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
            const products = await response.json();

            localStorage.setItem("ai_services", JSON.stringify(products));
            return products;
        } catch (error) {
            console.error("Lỗi khi tải products.json:", error);
            return [];
        }
    },

    // 2. Hàm nạp tài khoản từ account.json vào LocalStorage
    async initAccounts() {
        const existingAccounts = localStorage.getItem("ai_accounts");
        if (existingAccounts) {
            try {
                const parsed = JSON.parse(existingAccounts);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {
                console.warn("Lỗi đọc ai_accounts:", e);
            }
        }

        try {
            const isSubFolder = window.location.pathname.includes("/auth/") || window.location.pathname.includes("/policy/");
            const jsonPath = isSubFolder ? "../../data/account.json" : "../data/account.json";

            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
            const accounts = await response.json();

            localStorage.setItem("ai_accounts", JSON.stringify(accounts));
            return accounts;
        } catch (error) {
            console.error("Lỗi khi tải account.json:", error);
            return [];
        }
    },

    // Lấy danh sách dịch vụ
    getServices() {
        try {
            const data = localStorage.getItem("ai_services");
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    // Lấy dịch vụ theo ID
    getServiceById(id) {
        const services = this.getServices();
        return services.find(s => s.serviceId === id) || null;
    },

    // Lấy danh sách tài khoản
    getAccounts() {
        try {
            const data = localStorage.getItem("ai_accounts");
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    // Lấy phiên người dùng hiện tại
    getCurrentUser() {
        try {
            const data = localStorage.getItem("currentUser");
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }
};

// Đưa DataLoader lên phạm vi toàn cục
window.DataLoader = DataLoader;
