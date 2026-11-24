document.addEventListener("DOMContentLoaded", async () => {
    if (window.DataLoader) {
        await DataLoader.initData();
        await DataLoader.initAccounts();
    }

    initPolicyCartBadge();
    initPolicyHeaderAuth();
    setupPolicySearch();
});

function initPolicyCartBadge() {
    const badge = document.getElementById("cartCount");

    if (!badge) {
        return;
    }

    const cart = JSON.parse(localStorage.getItem("ai_cart")) || [];
    badge.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function initPolicyHeaderAuth() {
    const authArea = document.getElementById("userAuthArea");

    if (!authArea) {
        return;
    }

    const currentUser = window.DataLoader
        ? DataLoader.getCurrentUser()
        : JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
        authArea.innerHTML = `
            <a href="../profile.html" class="btn btn-secondary">
                <i class="fa-regular fa-user"></i> ${currentUser.username}
            </a>
            <button class="btn btn-outline" onclick="handlePolicyLogout()" title="Đăng xuất">
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
        `;
    } else {
        authArea.innerHTML = `
            <a href="../auth/login.html" class="btn btn-primary">
                <i class="fa-solid fa-arrow-right-to-bracket"></i> Đăng nhập
            </a>
        `;
    }
}

function setupPolicySearch() {
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    const goHome = () => {
        const kw = searchInput ? searchInput.value.trim() : "";
        window.location.href = kw ? `../index.html?q=${encodeURIComponent(kw)}#services` : "../index.html#services";
    };

    if (searchBtn) {
        searchBtn.addEventListener("click", goHome);
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                goHome();
            }
        });
    }
}

function handlePolicyLogout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../index.html";
}

window.handlePolicyLogout = handlePolicyLogout;