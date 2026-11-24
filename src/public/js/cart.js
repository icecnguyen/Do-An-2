let appliedVoucher = null;
const AVAILABLE_VOUCHERS = {
    SINHVIEN10: { type: "percent", value: 10, label: "Giảm 10% cho sinh viên" },
    CHERISMAI20K: { type: "fixed", value: 20000, label: "Giảm trực tiếp 20.000 đ" }
};

document.addEventListener("DOMContentLoaded", async () => {
    if (window.DataLoader) {
        await DataLoader.initData();
        await DataLoader.initOrders();
        await DataLoader.initPayments();
    }

    const currentUser = window.DataLoader ? DataLoader.getCurrentUser() : JSON.parse(localStorage.getItem("currentUser"));

    initHeaderAuth(currentUser);
    prefillReceiverInfo(currentUser);
    renderCart();
    setupCartActions(currentUser);
    setupSearchRedirect();
});

function initHeaderAuth(currentUser) {
    const authArea = document.getElementById("userAuthArea");

    if (!authArea) {
        return;
    }

    if (currentUser) {
        authArea.innerHTML = `
            <a href="profile.html" class="btn btn-secondary">
                <i class="fa-regular fa-user"></i> ${currentUser.username}
            </a>
            <button class="btn btn-outline" onclick="handleLogout()" title="Đăng xuất">
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
        `;
    }
    else {
        authArea.innerHTML = `
            <a href="auth/login.html?redirect=${encodeURIComponent("../cart.html")}" class="btn btn-primary">
                <i class="fa-solid fa-arrow-right-to-bracket"></i> Đăng nhập
            </a>
        `;
    }
}

function prefillReceiverInfo(currentUser) {
    if (!currentUser) {
        return;
    }

    const nameInput = document.getElementById("receiverName");
    const emailInput = document.getElementById("receiverEmail");

    if (nameInput && !nameInput.value) {
        nameInput.value = currentUser.fullName || currentUser.username || "";
    }

    if (emailInput && !emailInput.value) {
        emailInput.value = currentUser.email || "";
    }
}

function getCart() {
    try {
        return JSON.parse(localStorage.getItem("ai_cart")) || [];
    }
    catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("ai_cart", JSON.stringify(cart));
}

function renderCart() {
    const cart = getCart();
    const emptyBox = document.getElementById("emptyCartBox");
    const cartLayout = document.getElementById("cartLayout");
    const clearBtn = document.getElementById("clearCartBtn");
    const listEl = document.getElementById("cartItemsList");
    const badgeEl = document.getElementById("cartCount");
    const itemCountTag = document.getElementById("itemCountTag");
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (badgeEl) {
        badgeEl.innerText = totalQty;
    }

    if (cart.length === 0) {
        if (emptyBox) {
            emptyBox.style.display = "block";
        }

        if (cartLayout) {
            cartLayout.style.display = "none";
        }

        if (clearBtn) {
            clearBtn.style.display = "none";
        }
        return;
    }

    if (emptyBox) {
        emptyBox.style.display = "none";
    }

    if (cartLayout) {
        cartLayout.style.display = "grid";
    }

    if (clearBtn) {
        clearBtn.style.display = "inline-flex";
    }

    if (itemCountTag) {
        itemCountTag.innerText = `${totalQty} sản phẩm`;
    }

    const services = window.DataLoader ? DataLoader.getServices() : [];

    listEl.innerHTML = "";
    let subtotal = 0;

    cart.forEach((item, index) => {
        const svc = services.find(s => s.serviceId === item.serviceId) || {};
        const itemTotal = Number(item.price) * Number(item.quantity);
        subtotal += itemTotal;

        const thumbHtml = svc.thumbnailUrl
            ? `<img src="${svc.thumbnailUrl}" alt="${item.serviceName}">`
            : `<i class="${svc.iconClass || "fa-solid fa-cube"}" style="font-size: 22px; color: ${svc.iconColor || "#2563eb"};"></i>`;

        const typeLabel = item.productTypeLabel || svc.productTypeLabel || "";
        const row = document.createElement("div");
        row.className = "cart-item-row";
        row.innerHTML = `
            <div class="cart-item-thumb">${thumbHtml}</div>
            <div class="cart-item-info">
                <h4>${item.serviceName}</h4>
                <div class="cart-item-meta">
                    ${typeLabel ? `<span class="cart-type-tag">${typeLabel}</span>` : ""}
                    <span>${item.planDuration || svc.planDuration || "Gói tiêu chuẩn"}</span>
                    <span>•</span>
                    <span>${Number(item.price).toLocaleString("vi-VN")} đ</span>
                </div>
            </div>
            <div class="cart-qty-control">
                <button type="button" class="qty-btn" onclick="updateQuantity(${index}, -1)" title="Giảm">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button type="button" class="qty-btn" onclick="updateQuantity(${index}, 1)" title="Tăng">+</button>
            </div>
            <div class="cart-item-subtotal">${itemTotal.toLocaleString("vi-VN")} đ</div>
            <button type="button" class="remove-item-btn" onclick="removeItem(${index})" title="Xóa khỏi giỏ">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        listEl.appendChild(row);
    });

    const discount = calculateDiscount(subtotal);
    const finalTotal = Math.max(0, subtotal - discount);
    const summarySubtotal = document.getElementById("summarySubtotal");
    const summaryDiscount = document.getElementById("summaryDiscount");
    const summaryTotal = document.getElementById("summaryTotal");

    if (summarySubtotal) {
        summarySubtotal.innerText = `${subtotal.toLocaleString("vi-VN")} đ`;
    }

    if (summaryDiscount) {
        summaryDiscount.innerText = discount > 0 ? `-${discount.toLocaleString("vi-VN")} đ` : "0 đ";
    }

    if (summaryTotal) {
        summaryTotal.innerText = `${finalTotal.toLocaleString("vi-VN")} đ`;
    }

    updateDeliveryHint(cart, services);
}

function updateDeliveryHint(cart, services) {
    const hintBox = document.getElementById("deliveryTypeHint");

    if (!hintBox) {
        return;
    }

    const types = new Set(cart.map(item => {
        const svc = services.find(s => s.serviceId === item.serviceId) || {};
        return item.productType || svc.productType || "PRE_ACCOUNT";
    }));

    const lines = [];

    if (types.has("UPGRADE_OWN")) {
        lines.push("• <strong>Nâng cấp chính chủ:</strong> Nhập đúng Email tài khoản của bạn để hệ thống gửi lời mời kích hoạt.");
    }

    if (types.has("PRE_ACCOUNT")) {
        lines.push("• <strong>Tài khoản cấp sẵn:</strong> Thông tin đăng nhập (Email/Mật khẩu) sẽ được cấp trong Chi tiết đơn hàng.");
    }

    if (types.has("API_KEY")) {
        lines.push("• <strong>API Key:</strong> Mã Key và hạn mức Token sẽ được sinh trực tiếp trong Chi tiết đơn hàng sau khi thanh toán.");
    }

    if (lines.length > 0) {
        hintBox.style.display = "block";
        hintBox.innerHTML = lines.join("<br>");
    }
    else {
        hintBox.style.display = "none";
    }
}

function calculateDiscount(subtotal) {
    if (!appliedVoucher) {
        return 0;
    }

    if (appliedVoucher.type === "percent") {
        return Math.round((subtotal * appliedVoucher.value) / 100);
    }

    return Math.min(subtotal, appliedVoucher.value);
}

function updateQuantity(index, delta) {
    const cart = getCart();

    if (!cart[index]) {
        return;
    }

    cart[index].quantity += delta;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart(cart);
    renderCart();
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    showToast(`<i class="fa-solid fa-circle-info" style="color:#60a5fa"></i> Đã xóa dịch vụ khỏi giỏ hàng.`);
}

function setupCartActions(currentUser) {
    const clearBtn = document.getElementById("clearCartBtn");

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            saveCart([]);
            renderCart();
            showToast(`<i class="fa-solid fa-circle-info" style="color:#60a5fa"></i> Đã làm trống giỏ hàng.`);
        });
    }

    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            document.querySelectorAll(".payment-option").forEach(opt => opt.classList.remove("active"));
            radio.closest(".payment-option").classList.add("active");
        });
    });

    const applyVoucherBtn = document.getElementById("applyVoucherBtn");

    if (applyVoucherBtn) {
        applyVoucherBtn.addEventListener("click", () => {
            const voucherInput = document.getElementById("voucherInput");
            const voucherMsg = document.getElementById("voucherMsg");
            const code = (voucherInput ? voucherInput.value : "").trim().toUpperCase();

            if (!code) {
                appliedVoucher = null;
                if (voucherMsg) {
                    voucherMsg.className = "voucher-msg error";
                    voucherMsg.innerText = "Vui lòng nhập mã giảm giá.";
                }
                renderCart();
                return;
            }

            if (AVAILABLE_VOUCHERS[code]) {
                appliedVoucher = { code, ...AVAILABLE_VOUCHERS[code] };
                if (voucherMsg) {
                    voucherMsg.className = "voucher-msg success";
                    voucherMsg.innerText = `Đã áp dụng mã ${code}: ${AVAILABLE_VOUCHERS[code].label}.`;
                }
            }
            else {
                appliedVoucher = null;
                if (voucherMsg) {
                    voucherMsg.className = "voucher-msg error";
                    voucherMsg.innerText = "Mã giảm giá không hợp lệ (Thử: SINHVIEN10 hoặc CHERISMAI20K).";
                }
            }

            renderCart();
        });
    }

    const placeOrderBtn = document.getElementById("placeOrderBtn");

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", () => handleCheckout(currentUser));
    }

    const closeSuccessBtn = document.getElementById("closeSuccessModal");
    const successModal = document.getElementById("orderSuccessModal");

    if (closeSuccessBtn && successModal) {
        closeSuccessBtn.addEventListener("click", () => {
            successModal.classList.remove("active");
        });
        successModal.addEventListener("click", (e) => {
            if (e.target === successModal) {
                successModal.classList.remove("active");
            }
        });
    }
}

function handleCheckout(currentUser) {
    const cart = getCart();

    if (cart.length === 0) {
        showToast(`<i class="fa-solid fa-triangle-exclamation" style="color:#facc15"></i> Giỏ hàng đang trống.`);
        return;
    }

    const nameInput = document.getElementById("receiverName");
    const emailInput = document.getElementById("receiverEmail");
    const noteInput = document.getElementById("orderNote");
    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const receiverName = nameInput.value.trim();
    const receiverEmail = emailInput.value.trim();
    const note = noteInput ? noteInput.value.trim() : "";

    nameInput.classList.remove("error");
    emailInput.classList.remove("error");
    nameError.classList.remove("active");
    emailError.classList.remove("active");

    let valid = true;

    if (!receiverName) {
        nameInput.classList.add("error");
        nameError.classList.add("active");
        valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!receiverEmail || !emailRegex.test(receiverEmail)) {
        emailInput.classList.add("error");
        emailError.classList.add("active");
        valid = false;
    }

    if (!valid) {
        return;
    }

    const selectedMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = selectedMethodEl ? selectedMethodEl.value : "Chuyển khoản ngân hàng (MB Bank)";
    const services = window.DataLoader ? DataLoader.getServices() : [];
    const orderItems = cart.map(item => {
        const svc = services.find(s => s.serviceId === item.serviceId) || {};
        return {
            serviceId: item.serviceId,
            serviceName: item.serviceName,
            productType: item.productType || svc.productType || "PRE_ACCOUNT",
            productTypeLabel: item.productTypeLabel || svc.productTypeLabel || "Tài khoản cấp sẵn",
            apiEndpoint: item.apiEndpoint || svc.apiEndpoint || "",
            planDuration: item.planDuration || svc.planDuration || "30 ngày",
            price: Number(item.price),
            quantity: Number(item.quantity)
        };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = calculateDiscount(subtotal);
    const totalAmount = Math.max(0, subtotal - discountAmount);
    const now = new Date();
    const pad = n => String(n).padStart(2, "0");
    const dateCode = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const randSuffix = Math.floor(10 + Math.random() * 90);
    const orderId = `ORD-${dateCode}-${randSuffix}`;
    const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const createdAt = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const newOrder = {
        orderId,
        uid: currentUser ? currentUser.uid : "guest",
        username: currentUser ? currentUser.username : "guest",
        receiverName,
        receiverEmail,
        paymentMethod,
        note,
        items: orderItems,
        totalAmount,
        status: "pending",
        statusLabel: "Chờ xử lý",
        deliveredAccount: "",
        createdAt
    };

    const newPayment = {
        transactionId,
        orderId,
        uid: currentUser ? currentUser.uid : "guest",
        username: currentUser ? currentUser.username : "guest",
        amount: totalAmount,
        method: paymentMethod,
        status: "pending",
        statusLabel: "Chờ xác nhận",
        createdAt
    };

    const orders = JSON.parse(localStorage.getItem("ai_orders")) || [];
    orders.unshift(newOrder);
    localStorage.setItem("ai_orders", JSON.stringify(orders));

    const payments = JSON.parse(localStorage.getItem("ai_payments")) || [];
    payments.unshift(newPayment);
    localStorage.setItem("ai_payments", JSON.stringify(payments));

    saveCart([]);
    renderCart();

    document.getElementById("successOrderId").innerText = orderId;
    document.getElementById("successTxnId").innerText = transactionId;
    document.getElementById("successEmail").innerText = receiverEmail;
    document.getElementById("successMethod").innerText = paymentMethod;
    document.getElementById("successAmount").innerText = `${totalAmount.toLocaleString("vi-VN")} đ`;
    document.getElementById("successTransferContent").innerText = orderId;

    const bankGuide = document.getElementById("bankTransferGuide");
    const qrGuide = document.getElementById("qrPaymentGuide");
    const vietQrImg = document.getElementById("vietQrImg");
    const qrTransferContent = document.getElementById("qrTransferContent");

    if (paymentMethod.includes("QR")) {
        if (bankGuide) {
            bankGuide.style.display = "none";
        }

        if (qrGuide) {
            qrGuide.style.display = "flex";
        }

        if (qrTransferContent) {
            qrTransferContent.innerText = orderId;
        }

        if (vietQrImg) {
            const qrUrl = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(orderId)}&accountName=${encodeURIComponent("NGUYEN ANH QUAN")}`;
            vietQrImg.src = qrUrl;
        }
    }
    else {
        if (bankGuide) {
            bankGuide.style.display = "block";
        }

        if (qrGuide) {
            qrGuide.style.display = "none";
        }
    }

    const copyStkBtn = document.getElementById("copyStkBtn");
    const copyContentBtn = document.getElementById("copyContentBtn");

    if (copyStkBtn) {
        copyStkBtn.onclick = () => copyToClipboard("0987654321", "Đã sao chép số tài khoản.");
    }

    if (copyContentBtn) {
        copyContentBtn.onclick = () => copyToClipboard(orderId, "Đã sao chép nội dung chuyển khoản.");
    }

    const confirmPaidBtn = document.getElementById("confirmPaidBtn");

    if (confirmPaidBtn) {
        confirmPaidBtn.disabled = false;
        confirmPaidBtn.innerHTML = `<i class="fa-solid fa-check"></i> Xác nhận đã thanh toán (Mô phỏng)`;
        confirmPaidBtn.onclick = () => simulatePaymentConfirmation(orderId, transactionId, receiverEmail);
    }

    document.getElementById("orderSuccessModal").classList.add("active");
}

function buildDeliveredText(order, receiverEmail) {
    const items = order.items || [];

    if (items.length === 0) {
        return `Email: ${receiverEmail} (Đã kích hoạt gói dịch vụ)`;
    }

    return items.map(item => {
        const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
        if (item.productType === "API_KEY") {
            const endpoint = item.apiEndpoint || "https://api.cherismai.vn/v1";
            return `• ${item.serviceName}: Base URL: ${endpoint} | API Key: sk-cherismai-${rand.toLowerCase()}9x2a (Hạn mức: ${item.planDuration})`;
        }

        if (item.productType === "UPGRADE_OWN") {
            return `• ${item.serviceName}: Đã gửi lời mời nâng cấp chính chủ tới ${receiverEmail} (${item.planDuration})`;
        }
        return `• ${item.serviceName}: Tài khoản: ai_${rand.toLowerCase()}@cherismai.vn | MK: Cherism@${rand} (${item.planDuration})`;
    }).join("\n");
}

function simulatePaymentConfirmation(orderId, transactionId, receiverEmail) {
    const orders = JSON.parse(localStorage.getItem("ai_orders")) || [];
    const orderIdx = orders.findIndex(o => o.orderId === orderId);

    if (orderIdx !== -1) {
        orders[orderIdx].status = "completed";
        orders[orderIdx].statusLabel = "Đã cấp tài khoản";
        orders[orderIdx].deliveredAccount = buildDeliveredText(orders[orderIdx], receiverEmail);
        localStorage.setItem("ai_orders", JSON.stringify(orders));
    }

    const payments = JSON.parse(localStorage.getItem("ai_payments")) || [];
    const payIdx = payments.findIndex(p => p.transactionId === transactionId);

    if (payIdx !== -1) {
        payments[payIdx].status = "success";
        payments[payIdx].statusLabel = "Thành công";
        localStorage.setItem("ai_payments", JSON.stringify(payments));
    }

    const btn = document.getElementById("confirmPaidBtn");

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Đã thanh toán thành công`;
    }

    showToast(`<i class="fa-solid fa-circle-check" style="color:#4ade80"></i> Thanh toán thành công! Đang chuyển tới lịch sử đơn hàng...`);
    setTimeout(() => {
        window.location.href = "order_history.html";
    }, 1000);
}

function copyToClipboard(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`<i class="fa-solid fa-circle-check" style="color:#4ade80"></i> ${message}`);
        });
    }
    else {
        showToast(`<i class="fa-solid fa-circle-info" style="color:#60a5fa"></i> ${message}`);
    }
}

function setupSearchRedirect() {
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const goHomeSearch = () => {
        const kw = searchInput ? searchInput.value.trim() : "";
        window.location.href = kw ? `index.html?q=${encodeURIComponent(kw)}#services` : "index.html#services";
    };

    if (searchBtn) {
        searchBtn.addEventListener("click", goHomeSearch);
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                goHomeSearch();
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

window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
window.handleLogout = handleLogout;