let currentPayStatus = "ALL";
let currentPayKeyword = "";

document.addEventListener("DOMContentLoaded", async () => {
    if (window.DataLoader) {
        await DataLoader.initAccounts();
        await DataLoader.initPayments();
    }

    const currentUser = window.DataLoader
        ? DataLoader.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        window.location.href = `auth/login.html?redirect=${encodeURIComponent("../payment_history.html")}`;
        return;
    }

    initCartBadge();
    initHeaderUser(currentUser);
    populateSidebar(currentUser);
    updatePaymentStats(currentUser);
    setupFilters(currentUser);
    setupModalEvents();
    renderPayments(currentUser);
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

function getUserPayments(currentUser) {
    const allPayments = window.DataLoader
        ? DataLoader.getPayments()
        : (JSON.parse(localStorage.getItem("ai_payments")) || []);

    if (currentUser.role === "admin") {
        return allPayments;
    }

    return allPayments.filter(p => p.uid === currentUser.uid || p.uid === "guest");
}

function updatePaymentStats(currentUser) {
    const list = getUserPayments(currentUser);
    const totalCountEl = document.getElementById("totalTxnCount");
    const totalAmountEl = document.getElementById("totalPaidAmount");

    const paidTotal = list
        .filter(p => p.status === "success")
        .reduce((sum, p) => sum + Number(p.amount), 0);

    if (totalCountEl) {
        totalCountEl.innerText = list.length;
    }
    if (totalAmountEl) {
        totalAmountEl.innerText = `${paidTotal.toLocaleString("vi-VN")} đ`;
    }
}

function renderPayments(currentUser) {
    const tbody = document.getElementById("paymentsTableBody");
    const emptyState = document.getElementById("emptyPaymentsState");

    if (!tbody) {
        return;
    }

    const list = getUserPayments(currentUser);
    const filtered = list.filter(item => {
        const matchStatus = currentPayStatus === "ALL" || item.status === currentPayStatus;
        const kw = currentPayKeyword.toLowerCase().trim();
        const matchKeyword = !kw
            || item.transactionId.toLowerCase().includes(kw)
            || item.orderId.toLowerCase().includes(kw);
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

    filtered.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="code-cell">${item.transactionId}</td>
            <td class="code-cell">${item.orderId}</td>
            <td>${item.createdAt}</td>
            <td>${item.method}</td>
            <td class="amount-cell">${Number(item.amount).toLocaleString("vi-VN")} đ</td>
            <td>
                <span class="status-badge status-${item.status}">
                    ${item.statusLabel || getStatusText(item.status)}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button type="button" class="btn btn-secondary btn-xs" onclick="openReceipt('${item.transactionId}')">
                        Xem biên lai
                    </button>
                    ${item.status === "pending" ? `
                        <button type="button" class="btn-pay-xs btn-xs" onclick="simulatePayTxn('${item.transactionId}')">
                            Thanh toán
                        </button>
                    ` : ""}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getStatusText(status) {
    if (status === "success") {
        return "Thành công";
    }
    if (status === "pending") {
        return "Chờ xác nhận";
    }
    if (status === "cancelled") {
        return "Đã hủy";
    }
    return status;
}

function setupFilters(currentUser) {
    const pills = document.querySelectorAll("#paymentStatusFilters .filter-pill");
    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentPayStatus = pill.getAttribute("data-status");
            renderPayments(currentUser);
        });
    });

    const searchInput = document.getElementById("paymentSearchInput");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            currentPayKeyword = searchInput.value;
            renderPayments(currentUser);
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

function openReceipt(transactionId) {
    const list = JSON.parse(localStorage.getItem("ai_payments")) || [];
    const item = list.find(p => p.transactionId === transactionId);

    if (!item) {
        return;
    }

    document.getElementById("rcpTxnId").innerText = item.transactionId;
    document.getElementById("rcpOrderId").innerText = item.orderId;
    document.getElementById("rcpDate").innerText = item.createdAt;
    document.getElementById("rcpMethod").innerText = item.method;
    document.getElementById("rcpStatus").innerText = item.statusLabel || getStatusText(item.status);
    document.getElementById("rcpAmount").innerText = `${Number(item.amount).toLocaleString("vi-VN")} đ`;

    document.getElementById("receiptModal").classList.add("active");
}

function setupModalEvents() {
    const modal = document.getElementById("receiptModal");
    const close1 = document.getElementById("closeReceiptModal");
    const close2 = document.getElementById("closeReceiptModalBtn");

    const closeModal = () => {
        if (modal) {
            modal.classList.remove("active");
        }
    };

    if (close1) {
        close1.addEventListener("click", closeModal);
    }
    if (close2) {
        close2.addEventListener("click", closeModal);
    }
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

function simulatePayTxn(transactionId) {
    const payments = JSON.parse(localStorage.getItem("ai_payments")) || [];
    const payIndex = payments.findIndex(p => p.transactionId === transactionId);

    if (payIndex === -1) {
        return;
    }

    payments[payIndex].status = "success";
    payments[payIndex].statusLabel = "Thành công";
    localStorage.setItem("ai_payments", JSON.stringify(payments));

    const orderId = payments[payIndex].orderId;
    const orders = JSON.parse(localStorage.getItem("ai_orders")) || [];
    const orderIndex = orders.findIndex(o => o.orderId === orderId);

    if (orderIndex !== -1) {
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
    }

    const currentUser = DataLoader.getCurrentUser();
    updatePaymentStats(currentUser);
    renderPayments(currentUser);
    showToast(`<i class="fa-solid fa-circle-check" style="color:#4ade80"></i> Giao dịch ${transactionId} đã thanh toán thành công!`);
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

function handleLogout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

window.openReceipt = openReceipt;
window.simulatePayTxn = simulatePayTxn;
window.handleLogout = handleLogout;