let currentStatusFilter = "ALL";
let currentSearchKeyword = "";

document.addEventListener("DOMContentLoaded", async () => {
    if (window.DataLoader) {
        await DataLoader.initAccounts();
        await DataLoader.initOrders();
        await DataLoader.initPayments();
    }

    const currentUser = window.DataLoader
        ? DataLoader.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        window.location.href = `auth/login.html?redirect=${encodeURIComponent("../order_history.html")}`;
        return;
    }

    initCartBadge();
    initHeaderUser(currentUser);
    populateSidebar(currentUser);
    setupFilters(currentUser);
    setupModalEvents();
    renderOrders(currentUser);
});

function initCartBadge() {
    const badge = document.getElementById("cartCount");

    if (!badge) {
        return;
    }

    const cart = JSON.parse(localStorage.getItem("ai_cart")) || [];
    badge.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function initHeaderUser(currentUser) {
    const authArea = document.getElementById("userAuthArea");

    if (!authArea) {
        return;
    }

    authArea.innerHTML = `
        <a href="profile.html" class="btn btn-secondary">
            <i class="fa-regular fa-user"></i> ${currentUser.username}
        </a>
        <button class="btn btn-outline" onclick="handleLogout()" title="Đăng xuất">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
    `;
}

function populateSidebar(currentUser) {
    const avatarInitial = (currentUser.username || "U").charAt(0).toUpperCase();
    const sidebarAvatar = document.getElementById("sidebarAvatar");
    const sidebarUsername = document.getElementById("sidebarUsername");
    const sidebarEmail = document.getElementById("sidebarEmail");
    const sidebarRole = document.getElementById("sidebarRole");

    if (sidebarAvatar) {
        sidebarAvatar.innerText = avatarInitial;
    }
    if (sidebarUsername) {
        sidebarUsername.innerText = currentUser.username;
    }
    if (sidebarEmail) {
        sidebarEmail.innerText = currentUser.email;
    }
    if (sidebarRole) {
        sidebarRole.innerText = currentUser.role === "admin" ? "Quản trị viên" : "Khách hàng";
    }
}

function getUserOrders(currentUser) {
    const allOrders = window.DataLoader
        ? DataLoader.getOrders()
        : (JSON.parse(localStorage.getItem("ai_orders")) || []);

    if (currentUser.role === "admin") {
        return allOrders;
    }

    return allOrders.filter(o => o.uid === currentUser.uid || o.uid === "guest");
}

function renderOrders(currentUser) {
    const tbody = document.getElementById("ordersTableBody");
    const emptyState = document.getElementById("emptyOrdersState");

    if (!tbody) {
        return;
    }

    const userOrders = getUserOrders(currentUser);
    const filtered = userOrders.filter(order => {
        const matchStatus = currentStatusFilter === "ALL" || order.status === currentStatusFilter;
        const kw = currentSearchKeyword.toLowerCase().trim();
        const itemsText = (order.items || []).map(i => i.serviceName).join(" ").toLowerCase();
        const matchKeyword = !kw || order.orderId.toLowerCase().includes(kw) || itemsText.includes(kw);
        return matchStatus && matchKeyword;
    });

    tbody.innerHTML = "";

    if (filtered.length === 0) {
        if (emptyState) {
            emptyState.style.display = "block";
        }
        return;
    }

    if (emptyState) {
        emptyState.style.display = "none";
    }

    filtered.forEach(order => {
        const items = order.items || [];
        const firstService = items[0] ? items[0].serviceName : "Dịch vụ AI";
        const extraCount = items.length > 1 ? `<span class="service-sub-count">+${items.length - 1} dịch vụ khác</span>` : "";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="code-cell">${order.orderId}</td>
            <td>${order.createdAt}</td>
            <td>
                <span class="service-summary-text">${firstService}</span>
                ${extraCount}
            </td>
            <td class="amount-cell">${Number(order.totalAmount).toLocaleString("vi-VN")} đ</td>
            <td>
                <span class="status-badge status-${order.status}">
                    ${order.statusLabel || getStatusText(order.status)}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button type="button" class="btn btn-secondary btn-xs" onclick="openOrderDetail('${order.orderId}')">
                        Chi tiết
                    </button>
                    ${order.status === "pending" ? `
                        <button type="button" class="btn-pay-xs btn-xs" onclick="simulatePayOrder('${order.orderId}')">
                            Thanh toán
                        </button>
                        <button type="button" class="btn-danger-outline btn-xs" onclick="cancelOrder('${order.orderId}')">
                            Hủy đơn
                        </button>
                    ` : ""}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getStatusText(status) {
    if (status === "completed") {
        return "Đã cấp tài khoản";
    }
    if (status === "pending") {
        return "Chờ xử lý";
    }
    if (status === "cancelled") {
        return "Đã hủy";
    }
    return status;
}

function setupFilters(currentUser) {
    const pills = document.querySelectorAll("#orderStatusFilters .filter-pill");
    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentStatusFilter = pill.getAttribute("data-status");
            renderOrders(currentUser);
        });
    });

    const searchInput = document.getElementById("orderSearchInput");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            currentSearchKeyword = searchInput.value;
            renderOrders(currentUser);
        });
    }

    const headerSearch = document.getElementById("searchInput");
    const headerSearchBtn = document.getElementById("searchBtn");
    const goHomeSearch = () => {
        const kw = headerSearch ? headerSearch.value.trim() : "";
        window.location.href = kw ? `index.html?q=${encodeURIComponent(kw)}#services` : "index.html#services";
    };

    if (headerSearchBtn) {
        headerSearchBtn.addEventListener("click", goHomeSearch);
    }

    if (headerSearch) {
        headerSearch.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                goHomeSearch();
            }
        });
    }
}

function openOrderDetail(orderId) {
    const orders = JSON.parse(localStorage.getItem("ai_orders")) || [];
    const order = orders.find(o => o.orderId === orderId);

    if (!order) {
        return;
    }

    document.getElementById("detailModalTitle").innerText = `Chi tiết đơn hàng ${order.orderId}`;
    document.getElementById("detailOrderId").innerText = order.orderId;
    document.getElementById("detailCreatedAt").innerText = order.createdAt;
    document.getElementById("detailReceiver").innerText = order.receiverName || order.username;
    document.getElementById("detailEmail").innerText = order.receiverEmail || "-";
    document.getElementById("detailMethod").innerText = order.paymentMethod || "-";
    document.getElementById("detailStatus").innerHTML = `<span class="status-badge status-${order.status}">${order.statusLabel || getStatusText(order.status)}</span>`;
    document.getElementById("detailTotal").innerText = `${Number(order.totalAmount).toLocaleString("vi-VN")} đ`;

    const noteEl = document.getElementById("detailNote");

    if (noteEl) {
        noteEl.innerText = order.note ? order.note : "Không có";
    }

    const progressEl = document.getElementById("detailProgressBar");

    if (progressEl) {
        if (order.status === "cancelled") {
            progressEl.innerHTML = `
                <div class="progress-step done"><span class="step-dot">1</span><span>Đã tạo đơn</span></div>
                <div class="progress-step cancelled"><span class="step-dot"><i class="fa-solid fa-xmark"></i></span><span>Đơn hàng đã hủy</span></div>
                <div class="progress-step"><span class="step-dot">3</span><span>Bàn giao dịch vụ</span></div>
            `;
        } else {
            const isDone = order.status === "completed";
            progressEl.innerHTML = `
                <div class="progress-step done"><span class="step-dot"><i class="fa-solid fa-check"></i></span><span>1. Đã tạo đơn</span></div>
                <div class="progress-step ${isDone ? "done" : ""}"><span class="step-dot">${isDone ? `<i class="fa-solid fa-check"></i>` : "2"}</span><span>2. Thanh toán</span></div>
                <div class="progress-step ${isDone ? "done" : ""}"><span class="step-dot">${isDone ? `<i class="fa-solid fa-check"></i>` : "3"}</span><span>3. Bàn giao</span></div>
            `;
        }
    }

    const itemsBox = document.getElementById("detailItemsList");
    itemsBox.innerHTML = "";
    (order.items || []).forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${item.serviceName}</strong></td>
            <td>${item.productTypeLabel || "Tài khoản"}</td>
            <td>${item.planDuration || "30 ngày"}</td>
            <td>${item.quantity}</td>
            <td class="amount-cell">${(Number(item.price) * Number(item.quantity)).toLocaleString("vi-VN")} đ</td>
        `;
        itemsBox.appendChild(tr);
    });

    const deliveredBox = document.getElementById("deliveredInfoBox");
    const deliveredCardsList = document.getElementById("deliveredCardsList");

    if (order.status === "completed" && deliveredCardsList) {
        deliveredBox.style.display = "block";
        deliveredCardsList.innerHTML = "";

        const items = order.items || [];
        items.forEach((item, idx) => {
            const card = document.createElement("div");
            card.className = "delivery-item-card";

            const seedCode = `${order.orderId.slice(-4)}${idx + 1}`.toLowerCase();

            if (item.productType === "API_KEY") {
                const endpoint = item.apiEndpoint || (item.serviceId && item.serviceId.includes("DEEP") ? "https://api.deepseek.com/v1" : "https://api.cherismai.vn/v1");
                const apiKey = `sk-cherismai-${seedCode}k9x2m`;
                card.innerHTML = `
                    <div class="delivery-item-title">
                        <span>${item.serviceName}</span>
                        <span class="cart-type-tag">API Key • ${item.planDuration}</span>
                    </div>
                    <div class="delivery-kv-row">
                        <span>Base URL: <code>${endpoint}</code></span>
                        <button type="button" class="delivery-copy-btn" onclick="copyDetailText('${endpoint}', 'Đã sao chép Base URL')">Sao chép</button>
                    </div>
                    <div class="delivery-kv-row">
                        <span>API Key: <code>${apiKey}</code></span>
                        <button type="button" class="delivery-copy-btn" onclick="copyDetailText('${apiKey}', 'Đã sao chép API Key')">Sao chép</button>
                    </div>
                `;
            } else if (item.productType === "UPGRADE_OWN") {
                card.innerHTML = `
                    <div class="delivery-item-title">
                        <span>${item.serviceName}</span>
                        <span class="cart-type-tag">Nâng cấp chính chủ • ${item.planDuration}</span>
                    </div>
                    <div class="delivery-kv-row">
                        <span>Email kích hoạt: <code>${order.receiverEmail}</code></span>
                        <span>Đã kích hoạt</span>
                    </div>
                `;
            } else {
                const accEmail = `ai_${seedCode}@cherismai.vn`;
                const accPass = `Cherism@${seedCode.toUpperCase()}`;
                card.innerHTML = `
                    <div class="delivery-item-title">
                        <span>${item.serviceName}</span>
                        <span class="cart-type-tag">Tài khoản cấp sẵn • ${item.planDuration || "30 ngày"}</span>
                    </div>
                    <div class="delivery-kv-row">
                        <span>Tài khoản: <code>${accEmail}</code></span>
                        <button type="button" class="delivery-copy-btn" onclick="copyDetailText('${accEmail}', 'Đã sao chép tài khoản')">Sao chép</button>
                    </div>
                    <div class="delivery-kv-row">
                        <span>Mật khẩu: <code>${accPass}</code></span>
                        <button type="button" class="delivery-copy-btn" onclick="copyDetailText('${accPass}', 'Đã sao chép mật khẩu')">Sao chép</button>
                    </div>
                `;
            }

            deliveredCardsList.appendChild(card);
        });
    } else {
        deliveredBox.style.display = "none";
    }

    const footerEl = document.getElementById("detailModalFooter");

    if (footerEl) {
        footerEl.innerHTML = `
            ${order.status === "completed" ? `<a href="warranty.html?orderId=${encodeURIComponent(order.orderId)}" class="btn btn-secondary"><i class="fa-solid fa-screwdriver-wrench"></i> Yêu cầu bảo hành</a>` : ""}
            ${order.status === "pending" ? `<button type="button" class="btn btn-primary" onclick="simulatePayFromModal('${order.orderId}')"><i class="fa-solid fa-check"></i> Thanh toán ngay (Mô phỏng)</button>` : ""}
            <button type="button" class="btn btn-secondary" onclick="closeOrderModalFn()">Đóng</button>
        `;
    }

    document.getElementById("orderDetailModal").classList.add("active");
}

function closeOrderModalFn() {
    const modal = document.getElementById("orderDetailModal");

    if (modal) {
        modal.classList.remove("active");
    }
}

function simulatePayFromModal(orderId) {
    simulatePayOrder(orderId);
    openOrderDetail(orderId);
}

function copyDetailText(text, msg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`<i class="fa-solid fa-circle-check" style="color:#4ade80"></i> ${msg}`);
        });
    } else {
        showToast(`<i class="fa-solid fa-circle-info" style="color:#60a5fa"></i> ${msg}`);
    }
}

function simulatePayOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem("ai_orders")) || [];
    const orderIndex = orders.findIndex(o => o.orderId === orderId);

    if (orderIndex === -1) {
        return;
    }

    const receiverEmail = orders[orderIndex].receiverEmail || "email@example.com";
    orders[orderIndex].status = "completed";
    orders[orderIndex].statusLabel = "Đã cấp tài khoản";
    orders[orderIndex].deliveredAccount = (orders[orderIndex].items || []).map(item => {
        const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
        if (item.productType === "API_KEY") {
            const endpoint = item.apiEndpoint || "https://api.cherismai.vn/v1";
            return `• ${item.serviceName}: Base URL: ${endpoint} | API Key: sk-cherismai-${rand.toLowerCase()}9x2a (Hạn mức: ${item.planDuration})`;
        }
        if (item.productType === "UPGRADE_OWN") {
            return `• ${item.serviceName}: Đã gửi lời mời nâng cấp chính chủ tới ${receiverEmail} (${item.planDuration})`;
        }
        return `• ${item.serviceName}: Tài khoản: ai_${rand.toLowerCase()}@cherismai.vn | MK: Cherism@${rand} (${item.planDuration})`;
    }).join("\n") || `Email: ${receiverEmail} (Đã kích hoạt gói dịch vụ)`;
    localStorage.setItem("ai_orders", JSON.stringify(orders));

    const payments = JSON.parse(localStorage.getItem("ai_payments")) || [];
    const payIndex = payments.findIndex(p => p.orderId === orderId);

    if (payIndex !== -1) {
        payments[payIndex].status = "success";
        payments[payIndex].statusLabel = "Thành công";
        localStorage.setItem("ai_payments", JSON.stringify(payments));
    }

    const currentUser = DataLoader.getCurrentUser();
    renderOrders(currentUser);
    showToast(`<i class="fa-solid fa-circle-check" style="color:#4ade80"></i> Thanh toán thành công đơn ${orderId}!`);
}

function cancelOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem("ai_orders")) || [];
    const orderIndex = orders.findIndex(o => o.orderId === orderId);

    if (orderIndex === -1) {
        return;
    }

    orders[orderIndex].status = "cancelled";
    orders[orderIndex].statusLabel = "Đã hủy";
    localStorage.setItem("ai_orders", JSON.stringify(orders));

    const payments = JSON.parse(localStorage.getItem("ai_payments")) || [];
    const payIndex = payments.findIndex(p => p.orderId === orderId);

    if (payIndex !== -1) {
        payments[payIndex].status = "cancelled";
        payments[payIndex].statusLabel = "Đã hủy";
        localStorage.setItem("ai_payments", JSON.stringify(payments));
    }

    const currentUser = DataLoader.getCurrentUser();
    renderOrders(currentUser);
    showToast(`<i class="fa-solid fa-circle-info" style="color:#60a5fa"></i> Đã hủy đơn hàng ${orderId}.`);
}

function setupModalEvents() {
    const modal = document.getElementById("orderDetailModal");
    const close1 = document.getElementById("closeOrderModal");
    const close2 = document.getElementById("closeOrderModalBtn");

    if (close1) {
        close1.addEventListener("click", closeOrderModalFn);
    }
    if (close2) {
        close2.addEventListener("click", closeOrderModalFn);
    }
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeOrderModalFn();
            }
        });
    }
}

function handleLogout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

function showToast(htmlContent) {
    const toast = document.getElementById("toastMsg");

    if (!toast) {
        return;
    }

    toast.innerHTML = htmlContent;
    toast.classList.add("active");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("active");
    }, 2400);
}

window.openOrderDetail = openOrderDetail;
window.closeOrderModalFn = closeOrderModalFn;
window.simulatePayFromModal = simulatePayFromModal;
window.copyDetailText = copyDetailText;
window.simulatePayOrder = simulatePayOrder;
window.cancelOrder = cancelOrder;
window.handleLogout = handleLogout;