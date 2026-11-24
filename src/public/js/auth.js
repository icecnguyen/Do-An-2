document.addEventListener("DOMContentLoaded", async () => {
    if (window.DataLoader) {
        await DataLoader.initAccounts();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get("redirect") || "../index.html";

    initLoginForm(redirectUrl);
    initForgotPasswordModal();
    initRegisterForm(redirectUrl);
    initChangePasswordForm();
    initGlobalCartBadge();
    initPasswordToggles();
    initAuthHeaderSearch();
});

function initLoginForm(redirectUrl) {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    const currentUser = window.DataLoader ? DataLoader.getCurrentUser() : JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
        showAlert("Bạn đã đăng nhập. Đang chuyển hướng...", "success");
        setTimeout(() => { window.location.href = redirectUrl; }, 600);
        return;
    }

    const toRegLink = document.getElementById("toRegisterLink");

    if (toRegLink && redirectUrl) {
        toRegLink.href = `register.html?redirect=${encodeURIComponent(redirectUrl)}`;
    }

    const accountInput = document.getElementById("accountInput");
    const passwordInput = document.getElementById("passwordInput");
    const accountError = document.getElementById("accountError");
    const passwordError = document.getElementById("passwordError");
    const submitBtn = document.getElementById("submitBtn");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const accountVal = accountInput.value.trim();
        const passwordVal = passwordInput.value;

        hideAlert();

        accountInput.classList.remove("error");
        passwordInput.classList.remove("error");
        accountError.classList.remove("active");
        passwordError.classList.remove("active");

        let isValid = true;

        if (!accountVal) {
            accountInput.classList.add("error");
            accountError.classList.add("active");
            isValid = false;
        }

        if (!passwordVal) {
            passwordInput.classList.add("error");
            passwordError.classList.add("active");
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang xác thực...`;

        setTimeout(() => {
            const accounts = window.DataLoader ? DataLoader.getAccounts() : (JSON.parse(localStorage.getItem("ai_accounts")) || []);
            const matchedUser = accounts.find(acc =>
                (acc.username.toLowerCase() === accountVal.toLowerCase() || acc.email.toLowerCase() === accountVal.toLowerCase()) &&
                acc.password === passwordVal
            );

            if (matchedUser) {
                const sessionUser = {
                    uid: matchedUser.uid,
                    username: matchedUser.username,
                    email: matchedUser.email,
                    role: matchedUser.role || "user",
                    created_at: matchedUser.created_at || new Date().toISOString()
                };
                localStorage.setItem("currentUser", JSON.stringify(sessionUser));

                showAlert(`<i class="fa-solid fa-circle-check"></i> Đăng nhập thành công! Đang chuyển hướng...`, "success");

                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 800);
            }
            else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket"></i> Đăng nhập`;
                showAlert(`<i class="fa-solid fa-triangle-exclamation"></i> Tên đăng nhập hoặc mật khẩu không chính xác.`, "error");
            }
        }, 400);
    });
}

function initRegisterForm(redirectUrl) {
    const registerForm = document.getElementById("registerForm");

    if (!registerForm) {
        return;
    }

    const currentUser = window.DataLoader ? DataLoader.getCurrentUser() : JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
        window.location.href = "../index.html";
        return;
    }

    const toLoginLink = document.getElementById("toLoginLink");

    if (toLoginLink && redirectUrl) {
        toLoginLink.href = `login.html?redirect=${encodeURIComponent(redirectUrl)}`;
    }

    const usernameInput = document.getElementById("usernameInput");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const confirmPasswordInput = document.getElementById("confirmPasswordInput");
    const termsCheckbox = document.getElementById("termsCheckbox");
    const usernameError = document.getElementById("usernameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");
    const termsError = document.getElementById("termsError");
    const submitBtn = document.getElementById("submitBtn");

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const usernameVal = usernameInput.value.trim();
        const emailVal = emailInput.value.trim();
        const passwordVal = passwordInput.value;
        const confirmVal = confirmPasswordInput.value;

        hideAlert();

        [usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach(el => el.classList.remove("error"));
        [usernameError, emailError, passwordError, confirmPasswordError, termsError].forEach(el => el.classList.remove("active"));

        let isValid = true;

        if (usernameVal.length < 3) {
            usernameInput.classList.add("error");
            usernameError.classList.add("active");
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailVal)) {
            emailInput.classList.add("error");
            emailError.classList.add("active");
            isValid = false;
        }

        if (passwordVal.length < 6) {
            passwordInput.classList.add("error");
            passwordError.classList.add("active");
            isValid = false;
        }

        if (passwordVal !== confirmVal) {
            confirmPasswordInput.classList.add("error");
            confirmPasswordError.classList.add("active");
            isValid = false;
        }

        if (!termsCheckbox.checked) {
            termsError.classList.add("active");
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...`;

        setTimeout(() => {
            const accounts = window.DataLoader ? DataLoader.getAccounts() : (JSON.parse(localStorage.getItem("ai_accounts")) || []);
            const isDuplicateUser = accounts.some(acc => acc.username.toLowerCase() === usernameVal.toLowerCase());
            const isDuplicateEmail = accounts.some(acc => acc.email.toLowerCase() === emailVal.toLowerCase());

            if (isDuplicateUser) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> Đăng ký tài khoản`;
                usernameInput.classList.add("error");
                showAlert(`<i class="fa-solid fa-triangle-exclamation"></i> Tên đăng nhập "${usernameVal}" đã được sử dụng.`, "error");
                return;
            }

            if (isDuplicateEmail) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> Đăng ký tài khoản`;
                emailInput.classList.add("error");
                showAlert(`<i class="fa-solid fa-triangle-exclamation"></i> Địa chỉ email "${emailVal}" đã được đăng ký.`, "error");
                return;
            }

            const newUid = "usr" + String(accounts.length + 1).padStart(2, "0");
            const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
            const newAccount = {
                uid: newUid,
                email: emailVal,
                username: usernameVal,
                password: passwordVal,
                role: "user",
                created_at: nowStr,
                updated_at: nowStr
            };

            accounts.push(newAccount);
            localStorage.setItem("ai_accounts", JSON.stringify(accounts));

            showAlert(`<i class="fa-solid fa-circle-check"></i> Đăng ký tài khoản thành công! Đang chuyển đến trang đăng nhập...`, "success");
            setTimeout(() => {
                const targetLogin = redirectUrl
                    ? `login.html?redirect=${encodeURIComponent(redirectUrl)}&registered=true`
                    : `login.html?registered=true`;
                window.location.href = targetLogin;
            }, 1200);
        }, 400);
    });
}

function initChangePasswordForm() {
    const form = document.getElementById("changePasswordForm");
    if (!form) {
        return;
    }

    const currentUser = window.DataLoader ? DataLoader.getCurrentUser() : JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        window.location.href = `login.html?redirect=${encodeURIComponent("change.html")}`;
        return;
    }

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

    const authArea = document.getElementById("userAuthArea");

    if (authArea) {
        authArea.innerHTML = `
            <a href="../profile.html" class="btn btn-secondary">
                <i class="fa-regular fa-user"></i> ${currentUser.username}
            </a>
            <button class="btn btn-outline" onclick="handleLogout()" title="Đăng xuất">
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
        `;
    }

    const currentPasswordInput = document.getElementById("currentPasswordInput");
    const newPasswordInput = document.getElementById("newPasswordInput");
    const confirmNewPasswordInput = document.getElementById("confirmNewPasswordInput");
    const currentPasswordError = document.getElementById("currentPasswordError");
    const newPasswordError = document.getElementById("newPasswordError");
    const confirmNewPasswordError = document.getElementById("confirmNewPasswordError");
    const submitBtn = document.getElementById("submitBtn");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const curPass = currentPasswordInput.value;
        const newPass = newPasswordInput.value;
        const conPass = confirmNewPasswordInput.value;

        hideAlert();

        [currentPasswordInput, newPasswordInput, confirmNewPasswordInput].forEach(el => el.classList.remove("error"));
        [currentPasswordError, newPasswordError, confirmNewPasswordError].forEach(el => el.classList.remove("active"));

        let isValid = true;

        if (!curPass) {
            currentPasswordInput.classList.add("error");
            currentPasswordError.classList.add("active");
            isValid = false;
        }

        if (newPass.length < 6) {
            newPasswordInput.classList.add("error");
            newPasswordError.classList.add("active");
            isValid = false;
        }

        if (newPass !== conPass) {
            confirmNewPasswordInput.classList.add("error");
            confirmNewPasswordError.classList.add("active");
            isValid = false;
        }

        if (curPass === newPass && newPass) {
            newPasswordInput.classList.add("error");
            showAlert(`<i class="fa-solid fa-triangle-exclamation"></i> Mật khẩu mới không được trùng với mật khẩu hiện tại.`, "error");
            return;
        }

        if (!isValid) {
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang cập nhật...`;

        setTimeout(() => {
            const accounts = window.DataLoader ? DataLoader.getAccounts() : (JSON.parse(localStorage.getItem("ai_accounts")) || []);
            const targetIndex = accounts.findIndex(acc => acc.uid === currentUser.uid || acc.username === currentUser.username);

            if (targetIndex === -1 || accounts[targetIndex].password !== curPass) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Lưu mật khẩu mới`;
                currentPasswordInput.classList.add("error");
                showAlert(`<i class="fa-solid fa-triangle-exclamation"></i> Mật khẩu hiện tại không chính xác.`, "error");
                return;
            }

            accounts[targetIndex].password = newPass;
            accounts[targetIndex].updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
            localStorage.setItem("ai_accounts", JSON.stringify(accounts));

            showAlert(`<i class="fa-solid fa-circle-check"></i> Đổi mật khẩu thành công! Đang chuyển về hồ sơ...`, "success");
            setTimeout(() => {
                window.location.href = "../profile.html";
            }, 1000);
        }, 400);
    });
}

function initPasswordToggles() {
    setupToggle("togglePasswordBtn", "passwordInput", "togglePasswordIcon");
    setupToggle("toggleCurrentBtn", "currentPasswordInput", "toggleCurrentIcon");
    setupToggle("toggleNewBtn", "newPasswordInput", "toggleNewIcon");

    function setupToggle(btnId, inputId, iconId) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        if (!btn || !input || !icon) {
            return;
        }

        btn.addEventListener("click", () => {
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            icon.className = isPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
        });
    }
}

function initGlobalCartBadge() {
    const badge = document.getElementById("cartCount");

    if (!badge) {
        return;
    }

    const cart = JSON.parse(localStorage.getItem("ai_cart")) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = totalCount;
}

function showAlert(msg, type) {
    const alertBox = document.getElementById("authAlert");

    if (!alertBox) {
        return;
    }

    alertBox.innerHTML = msg;
    alertBox.className = `form-alert ${type}`;
    alertBox.style.display = "flex";
}

function hideAlert() {
    const alertBox = document.getElementById("authAlert");

    if (!alertBox) {
        return;
    }

    alertBox.style.display = "none";
}

function handleLogout() {
    localStorage.removeItem("currentUser");

    showToast(`<i class="fa-solid fa-circle-info" style="color:#60a5fa"></i> Đã đăng xuất tài khoản`);
    setTimeout(() => {
        window.location.href = "../index.html";
    }, 400);
}

function showToast(htmlContent) {
    let toast = document.getElementById("toastMsg");

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

function initForgotPasswordModal() {
    const openLink = document.getElementById("openForgotPwdLink");
    const modal = document.getElementById("forgotPasswordModal");
    const closeBtn = document.getElementById("closeForgotModal");
    const cancelBtn = document.getElementById("cancelForgotBtn");
    const form = document.getElementById("forgotPasswordForm");

    if (!openLink || !modal || !form) {
        return;
    }

    const alertEl = document.getElementById("forgotAlert");
    const showForgotAlert = (msg, type) => {
        if (!alertEl) {
            return;
        }

        alertEl.className = `form-alert ${type}`;
        alertEl.style.display = "flex";
        alertEl.innerHTML = msg;
    };

    const closeModal = () => {
        modal.classList.remove("active");

        if (alertEl) {
            alertEl.className = "form-alert";
            alertEl.style.display = "none";
        }
        form.reset();
    };

    openLink.addEventListener("click", () => modal.classList.add("active"));

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const accountVal = document.getElementById("forgotAccountInput").value.trim().toLowerCase();
        const newPwd = document.getElementById("forgotNewPwdInput").value;
        const confirmPwd = document.getElementById("forgotConfirmPwdInput").value;

        if (!accountVal) {
            showForgotAlert("Vui lòng nhập tên đăng nhập hoặc email.", "error");
            return;
        }

        if (newPwd.length < 6) {
            showForgotAlert("Mật khẩu mới phải có ít nhất 6 ký tự.", "error");
            return;
        }

        if (newPwd !== confirmPwd) {
            showForgotAlert("Xác nhận mật khẩu mới không khớp.", "error");
            return;
        }

        const accounts = JSON.parse(localStorage.getItem("ai_accounts")) || [];
        const idx = accounts.findIndex(a => a.username.toLowerCase() === accountVal || a.email.toLowerCase() === accountVal);

        if (idx === -1) {
            showForgotAlert("Không tìm thấy tài khoản khớp với tên đăng nhập hoặc email này.", "error");
            return;
        }

        accounts[idx].password = newPwd;
        localStorage.setItem("ai_accounts", JSON.stringify(accounts));

        showForgotAlert("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.", "success");
        setTimeout(() => {
            closeModal();
        }, 1200);
    });
}

function initAuthHeaderSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    if (!searchInput && !searchBtn) {
        return;
    }

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
