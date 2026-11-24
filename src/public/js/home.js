let activeDetailServiceId = null;
let activeSelectedDuration = null;
let activeSelectedPrice = null;
let selectedRatingStars = 5;

document.addEventListener("DOMContentLoaded", async () => {
    let services = [];

    if (window.DataLoader) {
        services = await DataLoader.initData();
        await DataLoader.initReviews();
    } else {
        services = JSON.parse(localStorage.getItem("ai_services")) || [];
    }

    renderServices(services);
    setupFilters();
    setupReviewForm();
    updateCartBadge();
    checkUserAuth();

    const modal = document.getElementById("serviceDetailModal");

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeDetailModal();
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeDetailModal();
        }
    });
});

function renderServices(items) {
    const container = document.getElementById("serviceList");

    if (!container) {
        return;
    }

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
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
            ${service.thumbnailUrl ? `
                <div class="card-thumb">
                    <img src="${service.thumbnailUrl}" alt="${service.serviceName}" loading="lazy">
                </div>
            ` : ""}
            <div class="card-body">
                <div class="card-header-line">
                    <div class="card-brand-wrap">
                        <div class="card-icon" style="background:${service.iconBg || "#eff6ff"}; color:${service.iconColor || "#2563eb"};">
                            <i class="${service.iconClass || "fa-solid fa-cube"}"></i>
                        </div>
                        <span class="card-tag">${service.categoryLabel || "Dịch vụ AI"}</span>
                    </div>
                    <span class="card-duration">${service.planDuration || "Gói cước"}</span>
                </div>
                <h3 class="card-title">${service.serviceName}</h3>
                ${service.productTypeLabel ? `<span class="card-type-badge type-${service.productType || "PRE_ACCOUNT"}">${service.productTypeLabel}</span>` : ""}
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

function setupFilters() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const productTypeFilter = document.getElementById("productTypeFilter");
    const priceFilter = document.getElementById("priceFilter");
    const sortFilter = document.getElementById("sortFilter");

    let currentCategory = "ALL";

    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get("q");

    if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
    }

    function applyFilter() {
        const services = window.DataLoader ? DataLoader.getServices() : (JSON.parse(localStorage.getItem("ai_services")) || []);
        const keyword = (searchInput ? searchInput.value : "").toLowerCase().trim();
        const typeRange = productTypeFilter ? productTypeFilter.value : "ALL";
        const priceRange = priceFilter ? priceFilter.value : "ALL";
        const sortType = sortFilter ? sortFilter.value : "DEFAULT";

        let filtered = services.filter(item => {
            const matchCat = (currentCategory === "ALL" || item.category === currentCategory);
            const matchType = (typeRange === "ALL" || item.productType === typeRange);
            const matchKeyword = item.serviceName.toLowerCase().includes(keyword) ||
                item.description.toLowerCase().includes(keyword);

            const price = Number(item.price);
            let matchPrice = true;

            if (priceRange === "UNDER_150") {
                matchPrice = price < 150000;
            } else if (priceRange === "150_250") {
                matchPrice = price >= 150000 && price <= 250000;
            } else if (priceRange === "ABOVE_250") {
                matchPrice = price > 250000;
            }

            return matchCat && matchType && matchKeyword && matchPrice;
        });

        if (sortType === "PRICE_ASC") {
            filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortType === "PRICE_DESC") {
            filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
        }

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

    if (searchInput) {
        searchInput.addEventListener("input", applyFilter);
    }
    if (searchBtn) {
        searchBtn.addEventListener("click", applyFilter);
    }
    if (productTypeFilter) {
        productTypeFilter.addEventListener("change", applyFilter);
    }
    if (priceFilter) {
        priceFilter.addEventListener("change", applyFilter);
    }
    if (sortFilter) {
        sortFilter.addEventListener("change", applyFilter);
    }

    if (initialQuery) {
        applyFilter();
    }
}

function addToCart(serviceId, customDuration = null, customPrice = null) {
    const services = window.DataLoader ? DataLoader.getServices() : (JSON.parse(localStorage.getItem("ai_services")) || []);
    const cart = JSON.parse(localStorage.getItem("ai_cart")) || [];
    const service = services.find(s => s.serviceId === serviceId);

    if (!service) {
        return;
    }

    const chosenDuration = customDuration || service.planDuration;
    const chosenPrice = customPrice !== null ? Number(customPrice) : Number(service.price);
    const existIndex = cart.findIndex(item =>
        item.serviceId === serviceId && (item.planDuration || service.planDuration) === chosenDuration
    );

    if (existIndex > -1) {
        cart[existIndex].quantity += 1;
    } else {
        cart.push({
            serviceId: service.serviceId,
            serviceName: service.serviceName,
            productType: service.productType || "PRE_ACCOUNT",
            productTypeLabel: service.productTypeLabel || "Tài khoản cấp sẵn",
            apiEndpoint: service.apiEndpoint || "",
            price: chosenPrice,
            planDuration: chosenDuration,
            categoryLabel: service.categoryLabel,
            thumbnailUrl: service.thumbnailUrl || "",
            quantity: 1
        });
    }

    localStorage.setItem("ai_cart", JSON.stringify(cart));
    updateCartBadge(true);
    showToast(`<i class="fa-solid fa-circle-check" style="color:#4ade80"></i> Đã thêm "${service.serviceName} (${chosenDuration})" vào giỏ`);
}

function updateCartBadge(shouldAnimate = false) {
    const cart = JSON.parse(localStorage.getItem("ai_cart")) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById("cartCount");

    if (!badge) {
        return;
    }

    badge.innerText = totalCount;

    if (shouldAnimate) {
        badge.classList.remove("bounce");
        void badge.offsetWidth;
        badge.classList.add("bounce");
    }
}

function openDetailModal(serviceId) {
    const service = window.DataLoader ? DataLoader.getServiceById(serviceId) : null;

    if (!service) {
        return;
    }

    activeDetailServiceId = serviceId;
    activeSelectedDuration = service.planDuration;
    activeSelectedPrice = Number(service.price);

    document.getElementById("modalServiceName").innerText = service.serviceName;
    document.getElementById("modalCategory").innerText = service.categoryLabel;

    const modalTypeEl = document.getElementById("modalProductType");

    if (modalTypeEl) {
        modalTypeEl.innerText = service.productTypeLabel || "Tài khoản";
    }

    const modalDurLabel = document.getElementById("modalDurationLabel");

    if (modalDurLabel) {
        modalDurLabel.innerText = service.productType === "API_KEY" ? "Hạn mức:" : "Thời hạn:";
    }

    document.getElementById("modalDuration").innerText = activeSelectedDuration;
    document.getElementById("modalPrice").innerText = `${activeSelectedPrice.toLocaleString("vi-VN")} đ`;
    document.getElementById("modalDesc").innerText = service.description;
    document.getElementById("modalDetail").innerText = service.detailedInfo || "Đang cập nhật thông tin bảo hành.";

    const durationWrap = document.getElementById("modalDurationWrap");
    const durationOpts = document.getElementById("modalDurationOptions");
    const optionTitle = document.getElementById("modalOptionTitle");

    if (durationWrap && durationOpts) {
        let plans = [];

        if (service.productType === "API_KEY") {
            if (optionTitle) {
                optionTitle.innerText = "Chọn gói hạn mức Token:";
            }
            plans = [
                { label: "5M tokens", price: Math.round(Number(service.price) * 0.4 / 1000) * 1000 },
                { label: service.planDuration, price: Number(service.price) },
                { label: "50M tokens", price: Math.round(Number(service.price) * 2.2 / 1000) * 1000 }
            ];
        } else if (service.planDuration === "30 ngày") {
            if (optionTitle) {
                optionTitle.innerText = "Chọn thời hạn gói:";
            }
            plans = [
                { label: "30 ngày", price: Number(service.price) },
                { label: "3 tháng (-5%)", price: Math.round(Number(service.price) * 3 * 0.95 / 1000) * 1000 },
                { label: "6 tháng (-10%)", price: Math.round(Number(service.price) * 6 * 0.90 / 1000) * 1000 }
            ];
        }

        if (plans.length > 0) {
            durationWrap.style.display = "block";
            durationOpts.innerHTML = "";
            const defaultIndex = service.productType === "API_KEY" ? 1 : 0;

            plans.forEach((p, idx) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = `duration-pill ${idx === defaultIndex ? "active" : ""}`;
                btn.innerText = p.label;
                btn.addEventListener("click", () => {
                    durationOpts.querySelectorAll(".duration-pill").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    activeSelectedDuration = p.label;
                    activeSelectedPrice = p.price;
                    document.getElementById("modalDuration").innerText = p.label;
                    document.getElementById("modalPrice").innerText = `${p.price.toLocaleString("vi-VN")} đ`;
                });
                durationOpts.appendChild(btn);
            });
        } else {
            durationWrap.style.display = "none";
        }
    }

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

    renderModalReviews(serviceId);

    const modal = document.getElementById("serviceDetailModal");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function renderModalReviews(serviceId) {
    const allReviews = window.DataLoader ? DataLoader.getReviews() : (JSON.parse(localStorage.getItem("ai_reviews")) || []);
    const reviews = allReviews.filter(r => r.serviceId === serviceId);
    const listEl = document.getElementById("modalReviewsList");
    const avgEl = document.getElementById("modalReviewAvg");

    if (!listEl || !avgEl) {
        return;
    }

    if (reviews.length === 0) {
        avgEl.innerText = "Chưa có đánh giá";
        listEl.innerHTML = `<div style="font-size: 12.5px; color: #64748b; padding: 4px 0;">Chưa có nhận xét nào cho gói dịch vụ này.</div>`;
        return;
    }

    const avg = (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1);
    avgEl.innerText = `${avg} ★ (${reviews.length} đánh giá)`;

    listEl.innerHTML = "";
    reviews.forEach(rev => {
        const div = document.createElement("div");
        div.className = "review-item";
        const stars = "★".repeat(rev.rating) + "☆".repeat(5 - rev.rating);
        div.innerHTML = `
            <div class="review-item-top">
                <strong>${rev.username} <span class="review-stars">${stars}</span></strong>
                <span style="color: #94a3b8; font-size: 11px;">${rev.createdAt}</span>
            </div>
            <p>${rev.comment}</p>
        `;
        listEl.appendChild(div);
    });
}

function setupReviewForm() {
    const starBtns = document.querySelectorAll("#starPicker .star-btn");
    starBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            selectedRatingStars = Number(btn.getAttribute("data-star"));
            starBtns.forEach(b => {
                b.classList.toggle("active", Number(b.getAttribute("data-star")) <= selectedRatingStars);
            });
        });
    });

    const form = document.getElementById("modalReviewForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!activeDetailServiceId) {
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem("currentUser"));

        if (!currentUser) {
            showToast(`<i class="fa-solid fa-circle-info" style="color:#60a5fa"></i> Vui lòng đăng nhập để gửi đánh giá`);
            return;
        }

        const input = document.getElementById("reviewCommentInput");
        const comment = input ? input.value.trim() : "";

        if (!comment) {
            showToast(`<i class="fa-solid fa-triangle-exclamation" style="color:#facc15"></i> Vui lòng nhập nội dung đánh giá`);
            return;
        }

        const now = new Date();
        const pad = n => String(n).padStart(2, "0");
        const newReview = {
            reviewId: `REV-${Date.now()}`,
            serviceId: activeDetailServiceId,
            uid: currentUser.uid,
            username: currentUser.username,
            rating: selectedRatingStars,
            comment,
            createdAt: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`
        };

        const reviews = JSON.parse(localStorage.getItem("ai_reviews")) || [];
        reviews.unshift(newReview);
        localStorage.setItem("ai_reviews", JSON.stringify(reviews));

        input.value = "";
        renderModalReviews(activeDetailServiceId);
        showToast(`<i class="fa-solid fa-circle-check" style="color:#4ade80"></i> Cảm ơn bạn đã gửi đánh giá!`);
    });
}

function closeDetailModal() {
    const modal = document.getElementById("serviceDetailModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
    document.body.style.overflow = "";
    activeDetailServiceId = null;
}

function addCurrentModalToCart() {
    if (activeDetailServiceId) {
        addToCart(activeDetailServiceId, activeSelectedDuration, activeSelectedPrice);
        closeDetailModal();
    }
}

function buyNowCurrentModal() {
    if (activeDetailServiceId) {
        addToCart(activeDetailServiceId, activeSelectedDuration, activeSelectedPrice);
        window.location.href = "cart.html";
    }
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

function checkUserAuth() {
    const authArea = document.getElementById("userAuthArea");

    if (!authArea) {
        return;
    }

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