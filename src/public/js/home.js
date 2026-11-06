// ============================================================
// DỰ ÁN: CherismAI - Nền tảng cung cấp dịch vụ AI
// TỆP: home.js - Xử lý logic hiển thị và tương tác trang chủ
// ============================================================

// 1. RENDER DANH SÁCH DỊCH VỤ VỚI STAGGERED ANIMATION
function renderServices(items) {
    const container = document.getElementById("serviceList");
    if (!container) return;
    container.innerHTML = "";

    if (!items || items.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                Không tìm thấy dịch vụ nào phù hợp với từ khóa hoặc danh mục đã chọn.
            </div>
        `;
        return;
    }

    items.forEach((service, index) => {
        const card = document.createElement("div");
        card.className = "service-card";
        // Staggered entrance animation
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
            ${service.thumbnailUrl ? `
                <div class="card-thumb">
                    <img src="${service.thumbnailUrl}" alt="${service.serviceName}" loading="lazy">
                </div>
            ` : ''}
            <div class="card-body">
                <div class="card-header-line">
                    <div class="card-brand-wrap">
                        <div class="card-icon" style="background:${service.iconBg || '#eff6ff'}; color:${service.iconColor || '#2563eb'};">
                            <i class="${service.iconClass || 'fa-solid fa-cube'}"></i>
                        </div>
                        <span class="card-tag">${service.categoryLabel || 'Dịch vụ AI'}</span>
                    </div>
                    <span class="card-duration">${service.planDuration || 'Gói cước'}</span>
                </div>
                <h3 class="card-title">${service.serviceName}</h3>
                <p class="card-desc">${service.description}</p>
                <div class="card-footer">
                    <span class="price">${Number(service.price).toLocaleString("vi-VN")} đ</span>
                    <div class="card-btns">
                        <button class="btn btn-secondary" onclick="openDetailModal('${service.serviceId}')">Chi tiết</button>
                        <button class="btn btn-primary" onclick="addToCart('${service.serviceId}')">
                            <i class="fa-solid fa-cart-plus"></i> Thêm
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 2. TÌM KIẾM VÀ LỌC THEO DANH MỤC
function setupFilters() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    let currentCategory = "ALL";

    function applyFilter() {
        const services = window.DataLoader ? DataLoader.getServices() : (JSON.parse(localStorage.getItem("ai_services")) || []);
        const keyword = (searchInput ? searchInput.value : "").toLowerCase().trim();
        const filtered = services.filter(item => {
            const matchCat = (currentCategory === "ALL" || item.category === currentCategory);
            const matchKeyword = item.serviceName.toLowerCase().includes(keyword) ||
                item.description.toLowerCase().includes(keyword);
            return matchCat && matchKeyword;
        });
        renderServices(filtered);
    }

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = btn.getAttribute("data-category");
            applyFilter();
        });
    });

    if (searchInput) searchInput.addEventListener("input", applyFilter);
    if (searchBtn) searchBtn.addEventListener("click", applyFilter);
}

// 3. QUẢN LÝ GIỎ HÀNG (CẬP NHẬT BADGE VỚI HIỆU ỨNG BOUNCE)
function addToCart(serviceId) {
    const services = window.DataLoader ? DataLoader.getServices() : (JSON.parse(localStorage.getItem("ai_services")) || []);
    let cart = JSON.parse(localStorage.getItem("ai_cart")) || [];

    const service = services.find(s => s.serviceId === serviceId);
    if (!service) return;

    const existIndex = cart.findIndex(item => item.serviceId === serviceId);
    if (existIndex > -1) {
        cart[existIndex].quantity += 1;
    } else {
        cart.push({
            serviceId: service.serviceId,
            serviceName: service.serviceName,
            price: service.price,
            planDuration: service.planDuration,
            categoryLabel: service.categoryLabel,
            thumbnailUrl: service.thumbnailUrl || '',
            quantity: 1
        });
    }

    localStorage.setItem("ai_cart", JSON.stringify(cart));
    updateCartBadge(true);
    showToast(`<i class="fa-solid fa-circle-check" style="color:#4ade80"></i> Đã thêm "${service.serviceName}" vào giỏ hàng`);
}

function updateCartBadge(shouldAnimate = false) {
    const cart = JSON.parse(localStorage.getItem("ai_cart")) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById("cartCount");
    if (badge) {
        badge.innerText = totalCount;
        if (shouldAnimate) {
            badge.classList.remove("bounce");
            void badge.offsetWidth; // Trigger reflow để kích hoạt lại animation
            badge.classList.add("bounce");
        }
    }
}

// 4. MODAL XEM CHI TIẾT DỊCH VỤ
let activeDetailServiceId = null;

function openDetailModal(serviceId) {
    const service = window.DataLoader ? DataLoader.getServiceById(serviceId) : null;
    if (!service) return;

    activeDetailServiceId = serviceId;
    document.getElementById("modalServiceName").innerText = service.serviceName;
    document.getElementById("modalCategory").innerText = service.categoryLabel;
    document.getElementById("modalDuration").innerText = service.planDuration;
    document.getElementById("modalPrice").innerText = Number(service.price).toLocaleString("vi-VN") + " đ";
    document.getElementById("modalDesc").innerText = service.description;
    document.getElementById("modalDetail").innerText = service.detailedInfo || "Đang cập nhật thông tin bảo hành.";

    // Cập nhật thumbnail trong Modal
    const thumbCont = document.getElementById("modalThumbContainer");
    const thumbImg = document.getElementById("modalThumbnail");
    if (thumbCont && thumbImg) {
        if (service.thumbnailUrl) {
            thumbImg.src = service.thumbnailUrl;
            thumbCont.style.display = "block";
        } else {
            thumbCont.style.display = "none";
        }
    }

    const modal = document.getElementById("serviceDetailModal");
    modal.classList.add("active");
    document.body.style.overflow = "hidden"; // Ngăn cuộn trang phía sau
}

function closeDetailModal() {
    const modal = document.getElementById("serviceDetailModal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
    activeDetailServiceId = null;
}

function addCurrentModalToCart() {
    if (activeDetailServiceId) {
        addToCart(activeDetailServiceId);
        closeDetailModal();
    }
}

// 5. THÔNG BÁO TOAST
function showToast(htmlContent) {
    let toast = document.getElementById("toastMsg");
    if (!toast) return;
    toast.innerHTML = htmlContent;
    toast.classList.add("active");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.classList.remove("active");
    }, 2400);
}

// 6. HIỂN THỊ TRẠNG THÁI NGƯỜI DÙNG Ở HEADER
function checkUserAuth() {
    const authArea = document.getElementById("userAuthArea");
    if (!authArea) return;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
        authArea.innerHTML = `
            <a href="profile.html" class="btn btn-secondary">
                <i class="fa-regular fa-user"></i> ${currentUser.username || "Tài khoản"}
            </a>
            <button class="btn btn-outline" onclick="handleLogout()" title="Đăng xuất">
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
        `;
    } else {
        authArea.innerHTML = `
            <a href="auth/login.html" class="btn btn-primary">
                <i class="fa-solid fa-arrow-right-to-bracket"></i> Đăng nhập
            </a>
        `;
    }
}

function handleLogout() {
    localStorage.removeItem("currentUser");
    showToast(`<i class="fa-solid fa-circle-info" style="color:#60a5fa"></i> Đã đăng xuất tài khoản`);
    setTimeout(() => {
        window.location.reload();
    }, 450);
}

// 7. KHỞI CHẠY TRANG
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Nạp dữ liệu qua DataLoader (ưu tiên JSON -> LocalStorage)
    let services = [];
    if (window.DataLoader) {
        services = await DataLoader.initData();
    } else {
        services = JSON.parse(localStorage.getItem("ai_services")) || [];
    }

    // 2. Render giao diện và gán sự kiện
    renderServices(services);
    setupFilters();
    updateCartBadge();
    checkUserAuth();

    // 3. Sự kiện đóng Modal
    const modal = document.getElementById("serviceDetailModal");
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeDetailModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDetailModal();
    });
});
