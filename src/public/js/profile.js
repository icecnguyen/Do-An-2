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
        window.location.href = `auth/login.html?redirect=${encodeURIComponent("../profile.html")}`;
        return;
    }

    initCartBadge();
    initHeaderUser(currentUser);
    populateUserData(currentUser);
    updateAccountStats();
    setupProfileForm(currentUser);
});

function initCartBadge() {
    const badge = document.getElementById("cartCount");

    if (!badge) {
        return;
    }

    const cart = JSON.parse(localStorage.getItem("ai_cart")) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = totalCount;
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

function populateUserData(currentUser) {
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

    const uidInput = document.getElementById("uidInput");
    const roleInput = document.getElementById("roleInput");
    const usernameInput = document.getElementById("usernameInput");
    const emailInput = document.getElementById("emailInput");
    const createdAtInput = document.getElementById("createdAtInput");

    if (uidInput) {
        uidInput.value = currentUser.uid || "usr01";
    }
    if (roleInput) {
        roleInput.value = currentUser.role === "admin" ? "Quản trị viên (Admin)" : "Khách hàng (User)";
    }
    if (usernameInput) {
        usernameInput.value = currentUser.username;
    }
    if (emailInput) {
        emailInput.value = currentUser.email;
    }
    if (createdAtInput) {
        createdAtInput.value = currentUser.created_at || "19/09/2026";
    }
}

function updateAccountStats() {
    const orders = JSON.parse(localStorage.getItem("ai_orders")) || [];
    const payments = JSON.parse(localStorage.getItem("ai_payments")) || [];
    const statOrder = document.getElementById("statOrderCount");
    const statPayment = document.getElementById("statPaymentCount");

    if (statOrder) {
        statOrder.innerText = orders.length;
    }
    if (statPayment) {
        statPayment.innerText = payments.length;
    }
}

function setupProfileForm(currentUser) {
    const profileForm = document.getElementById("profileForm");

    if (!profileForm) {
        return;
    }

    const usernameInput = document.getElementById("usernameInput");
    const emailInput = document.getElementById("emailInput");
    const usernameError = document.getElementById("usernameError");
    const emailError = document.getElementById("emailError");
    const saveBtn = document.getElementById("saveProfileBtn");

    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const usernameVal = usernameInput.value.trim();
        const emailVal = emailInput.value.trim();

        usernameInput.classList.remove("error");
        emailInput.classList.remove("error");
        if (usernameError) {
            usernameError.classList.remove("active");
        }
        if (emailError) {
            emailError.classList.remove("active");
        }
        hideAlert();

        let isValid = true;

        if (usernameVal.length < 3) {
            usernameInput.classList.add("error");
            if (usernameError) {
                usernameError.classList.add("active");
            }
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailVal)) {
            emailInput.classList.add("error");
            if (emailError) {
                emailError.classList.add("active");
            }
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        const accounts = window.DataLoader ? DataLoader.getAccounts() : (JSON.parse(localStorage.getItem("ai_accounts")) || []);
        const duplicate = accounts.find(acc =>
            acc.uid !== currentUser.uid &&
            (acc.username.toLowerCase() === usernameVal.toLowerCase() || acc.email.toLowerCase() === emailVal.toLowerCase())
        );

        if (duplicate) {
            showAlert(`<i class="fa-solid fa-triangle-exclamation"></i> Tên người dùng hoặc email đã tồn tại ở tài khoản khác.`, "error");
            return;
        }

        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...`;

        setTimeout(() => {
            currentUser.username = usernameVal;
            currentUser.email = emailVal;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            const accIndex = accounts.findIndex(acc => acc.uid === currentUser.uid);

            if (accIndex > -1) {
                accounts[accIndex].username = usernameVal;
                accounts[accIndex].email = emailVal;
                accounts[accIndex].updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
                localStorage.setItem("ai_accounts", JSON.stringify(accounts));
            }

            populateUserData(currentUser);
            initHeaderUser(currentUser);

            saveBtn.disabled = false;
            saveBtn.innerHTML = `<i class="fa-regular fa-floppy-disk"></i> Lưu thay đổi`;

            showToast(`<i class="fa-solid fa-circle-check" style="color:#4ade80"></i> Cập nhật thông tin hồ sơ thành công!`);
        }, 350);
    });
}

function showAlert(msg, type) {
    const alertBox = document.getElementById("profileAlert");

    if (!alertBox) {
        return;
    }

    alertBox.innerHTML = msg;
    alertBox.className = `form-alert ${type}`;
    alertBox.style.display = "flex";
}

function hideAlert() {
    const alertBox = document.getElementById("profileAlert");

    if (!alertBox) {
        return;
    }

    alertBox.style.display = "none";
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
    showToast(`<i class="fa-solid fa-circle-info" style="color:#60a5fa"></i> Đã đăng xuất tài khoản`);
    setTimeout(() => {
        window.location.href = "index.html";
    }, 400);
}