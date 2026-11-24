let uploadedEvidenceBase64 = "";

document.addEventListener("DOMContentLoaded", async () => {
    if (window.DataLoader) {
        await DataLoader.initAccounts();
        await DataLoader.initOrders();
        await DataLoader.initWarranties();
    }

    const currentUser = window.DataLoader
        ? DataLoader.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        window.location.href = `auth/login.html?redirect=${encodeURIComponent("../warranty.html")}`;
        return;
    }

    initCartBadge();
    initHeaderUser(currentUser);
    populateSidebar(currentUser);
    populateOrderSelect(currentUser);
    setupFileUpload();
    setupWarrantyForm(currentUser);
    setupModalEvents();
    renderWarranties(currentUser);
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

function populateOrderSelect(currentUser) {
    const select = document.getElementById("warrantyOrderId");

    if (!select) {
        return;
    }

    const orders = window.DataLoader ? DataLoader.getOrders() : (JSON.parse(localStorage.getItem("ai_orders")) || []);
    const userOrders = currentUser.role === "admin"
        ? orders
        : orders.filter(o => (o.uid === currentUser.uid || o.uid === "guest") && o.status !== "cancelled");

    userOrders.forEach(o => {
        const firstService = o.items && o.items[0] ? o.items[0].serviceName : "Dịch vụ AI";
        const opt = document.createElement("option");
        opt.value = o.orderId;
        opt.textContent = `${o.orderId} — ${firstService} (${o.createdAt})`;
        select.appendChild(opt);
    });

    const params = new URLSearchParams(window.location.search);
    const preOrderId = params.get("orderId");

    if (preOrderId) {
        select.value = preOrderId;
    }
}

function setupFileUpload() {
    const fileInput = document.getElementById("warrantyFile");
    const previewBox = document.getElementById("filePreviewBox");
    const previewImg = document.getElementById("filePreviewImg");
    const removeBtn = document.getElementById("removeFileBtn");

    if (!fileInput) {
        return;
    }

    fileInput.addEventListener("change", () => {
        const file = fileInput.files && fileInput.files[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedEvidenceBase64 = e.target.result;
            if (previewImg) {
                previewImg.src = uploadedEvidenceBase64;
            }
            if (previewBox) {
                previewBox.style.display = "flex";
            }
        };
        reader.readAsDataURL(file);
    });

    if (removeBtn) {
        removeBtn.addEventListener("click", () => {
            uploadedEvidenceBase64 = "";
            fileInput.value = "";
            if (previewBox) {
                previewBox.style.display = "none";
            }
        });
    }
}

function setupWarrantyForm(currentUser) {
    const form = document.getElementById("warrantyForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const orderId = document.getElementById("warrantyOrderId").value;
        const issueType = document.getElementById("warrantyIssueType").value;
        const description = document.getElementById("warrantyDesc").value.trim();

        if (!orderId) {
            showToast(`<i class="fa-solid fa-triangle-exclamation" style="color:#facc15"></i> Vui lòng chọn mã đơn hàng cần bảo hành.`);
            return;
        }

        if (!description) {
            showToast(`<i class="fa-solid fa-triangle-exclamation" style="color:#facc15"></i> Vui lòng mô tả chi tiết sự cố gặp phải.`);
            return;
        }

        const now = new Date();
        const pad = n => String(n).padStart(2, "0");
        const dateCode = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
        const ticketId = `BH-${dateCode}-${Math.floor(10 + Math.random() * 90)}`;
        const createdAt = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

        const newTicket = {
            ticketId,
            orderId,
            uid: currentUser.uid,
            username: currentUser.username,
            issueType,
            description,
            evidenceImage: uploadedEvidenceBase64,
            ticketStatus: "pending",
            statusLabel: "Đang tiếp nhận",
            staffNote: "",
            createdAt
        };

        const list = JSON.parse(localStorage.getItem("ai_warranties")) || [];
        list.unshift(newTicket);
        localStorage.setItem("ai_warranties", JSON.stringify(list));

        form.reset();
        uploadedEvidenceBase64 = "";

        const previewBox = document.getElementById("filePreviewBox");

        if (previewBox) {
            previewBox.style.display = "none";
        }

        renderWarranties(currentUser);
        showToast(`<i class="fa-solid fa-circle-check" style="color:#4ade80"></i> Đã gửi phiếu bảo hành ${ticketId} thành công!`);
    });
}

function renderWarranties(currentUser) {
    const tbody = document.getElementById("warrantyTableBody");
    const emptyState = document.getElementById("emptyWarrantyState");

    if (!tbody) {
        return;
    }

    const all = window.DataLoader ? DataLoader.getWarranties() : (JSON.parse(localStorage.getItem("ai_warranties")) || []);
    const list = currentUser.role === "admin" ? all : all.filter(w => w.uid === currentUser.uid);

    tbody.innerHTML = "";

    if (list.length === 0) {
        if (emptyState) {
            emptyState.style.display = "block";
        }
        return;
    }

    if (emptyState) {
        emptyState.style.display = "none";
    }

    list.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="code-cell">${item.ticketId}</td>
            <td class="code-cell">${item.orderId}</td>
            <td>${item.issueType}</td>
            <td>${item.createdAt}</td>
            <td>
                <span class="status-badge status-${item.ticketStatus}">
                    ${item.statusLabel || (item.ticketStatus === "resolved" ? "Đã xử lý" : "Đang tiếp nhận")}
                </span>
            </td>
            <td>
                <button type="button" class="btn btn-secondary btn-xs" onclick="openWarrantyDetail('${item.ticketId}')">
                    Chi tiết
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openWarrantyDetail(ticketId) {
    const list = JSON.parse(localStorage.getItem("ai_warranties")) || [];
    const item = list.find(w => w.ticketId === ticketId);

    if (!item) {
        return;
    }

    document.getElementById("wDetailId").innerText = item.ticketId;
    document.getElementById("wDetailOrder").innerText = item.orderId;
    document.getElementById("wDetailType").innerText = item.issueType;
    document.getElementById("wDetailStatus").innerText = item.statusLabel || item.ticketStatus;
    document.getElementById("wDetailDesc").innerText = item.description;

    const imgWrap = document.getElementById("wDetailImgWrap");
    const imgEl = document.getElementById("wDetailImg");

    if (item.evidenceImage) {
        imgEl.src = item.evidenceImage;
        imgWrap.style.display = "block";
    } else {
        imgWrap.style.display = "none";
    }

    const noteBox = document.getElementById("wStaffNoteBox");
    const noteText = document.getElementById("wStaffNoteText");

    if (item.staffNote) {
        noteText.innerText = item.staffNote;
        noteBox.style.display = "block";
    } else {
        noteBox.style.display = "none";
    }

    document.getElementById("warrantyDetailModal").classList.add("active");
}

function setupModalEvents() {
    const modal = document.getElementById("warrantyDetailModal");
    const close1 = document.getElementById("closeWarrantyModal");
    const close2 = document.getElementById("closeWarrantyModalBtn");

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

window.openWarrantyDetail = openWarrantyDetail;
window.handleLogout = handleLogout;