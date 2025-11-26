// Here I create a function to validate email fields checking for presence of "@" and "."
function validateEmail(value) {
    if (!value) {
        return "Email is required";
    }

    const trimmed = value.trim();
    const hasAt = trimmed.includes("@");
    const hasDot = trimmed.includes(".");

    if (!hasAt || !hasDot) {
        return "Enter a valid email address";
    }

    return null;
}
// Here I create a function to validate password fields checking for minimum length of 8 characters
function validatePassword(value) {
    if (!value) {
        return "Password is required";
    }

    if (value.length < 8) {
        return "Password must be at least eight characters long";
    }

    return null;
}

// Here I create a function to mock fetch requests for the /api/login endpoint
function installMockFetch() {
    //Here I check if the mock fetch is already installed to avoid double installation
    if (window.__mockFetchInstalled) return;
    window.__mockFetchInstalled = true;

    const originalFetch = window.fetch
        ? window.fetch.bind(window)
        : null;

    window.fetch = async (input, init = {}) => {
        const url = typeof input === "string" ? input : input.url;

        if (url === "/api/login") {
            return mockLoginRequest(init);
        }

        if (originalFetch) {
            return originalFetch(input, init);
        }

        throw new Error("Network unavailable in this environment");
    };
}
//Here I create a function to simulate a login request with validation and simple authentication logic
function mockLoginRequest(init) {
    const bodyText = typeof init.body === "string" ? init.body : "{}";
    let body;

    try {
        body = JSON.parse(bodyText);
    } catch {
        body = {};
    }

    const { email = "", password = "" } = body;

    return new Promise((resolve) => {
        //Here I simulate network latency with a timeout of 1100 milliseconds
        setTimeout(() => {
            const emailError = validateEmail(email);
            const passwordError = validatePassword(password);

            if (emailError || passwordError) {
                resolve(
                    createJsonResponse(
                        {
                            ok: false,
                            errors: {
                                email: emailError,
                                password: passwordError,
                            },
                        },
                        400,
                    ),
                );
                return;
            }

            //Here I define simple authentication logic for demo users 
            const isDemoUser = email.toLowerCase().endsWith("@example.com");

            if (!isDemoUser || password === "password") {
                resolve(
                    createJsonResponse(
                        {
                            ok: false,
                            message: "Email or password is not correct",
                        },
                        401,
                    ),
                );
                return;
            }

            resolve(
                createJsonResponse(
                    {
                        ok: true,
                        user: {
                            email,
                            plan: "Pro",
                        },
                    },
                    200,
                ),
            );
        }, 1100);
    });
}
//Here I create a function to generate a JSON response with the given status code
function createJsonResponse(json, status) {
    const blob = new Blob([JSON.stringify(json)], {
        type: "application/json",
    });

    const responseInit = {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    };


    return new Response(blob, responseInit);
}


//Here I create the main function to set up the login application
function setupLoginApp() {
    installMockFetch();

    const loginView = document.getElementById("login-view");
    const successView = document.getElementById("success-view");
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberInput = document.getElementById("remember");
    const submitButton = document.getElementById("submit-button");
    const togglePasswordButton = document.getElementById("toggle-password");
    const errorSummary = document.getElementById("form-errors");
    const errorSummaryList = document.getElementById("error-summary-list");
    const notificationRegion = document.getElementById("notification-region");
    const welcomeHeading = document.getElementById("welcome-heading");
    const welcomeMessage = document.getElementById("welcome-message");
    const signOutButton = document.getElementById("sign-out-button");
    const yearElement = document.getElementById("current-year");
    const themeToggle = document.getElementById("theme-toggle");
    const logoImg = document.getElementById("app-logo");
    const appSubtitle = document.getElementById("app-subtitle");
    const defaultSubtitle =
        appSubtitle?.textContent?.trim() ||
        "Sign in to continue to your workspace";
    const THEME_STORAGE_KEY = "app-theme";
    const logoLightSrc =
        logoImg?.getAttribute("data-light-src") || logoImg?.getAttribute("src");
    const logoDarkSrc =
        logoImg?.getAttribute("data-dark-src") || logoLightSrc;
    if (
        !loginView ||
        !successView ||
        !loginForm ||
        !emailInput ||
        !passwordInput ||
        !submitButton
    ) {
        console.error("Sign in app did not find expected elements");
        return;
    }

    let isSubmitting = false;

    if (yearElement) {
        yearElement.textContent = String(new Date().getFullYear());
    }
    //Here I create a function to apply the selected theme and update the UI accordingly
    function applyTheme(theme) {
        const isDark = theme === "dark";
        document.body.classList.toggle("theme-dark", isDark);
        if (themeToggle) {
            themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
            themeToggle.setAttribute("aria-pressed", String(isDark));
        }
        if (logoImg && logoLightSrc && logoDarkSrc) {
            logoImg.src = isDark ? logoDarkSrc : logoLightSrc;
        }
        try {
            localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
        } catch {
            console.log("Could not save theme preference");
        }
    }
    //Here I retrieve the saved theme from localStorage and apply it on load
    const savedTheme = (() => {
        try {
            return localStorage.getItem(THEME_STORAGE_KEY);
        } catch {
            return null;
        }
    })();
    applyTheme(savedTheme === "dark" ? "dark" : "light");

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = document.body.classList.contains("theme-dark")
                ? "light"
                : "dark";
            applyTheme(nextTheme);
        });
    }

    //Here I initialize the views to show the login form and hide the success message
    loginView.hidden = false;
    successView.hidden = true;
    //Here I create a function to manage the submitting state of the form
    function setSubmitting(next) {
        isSubmitting = next;
        submitButton.disabled = next;

        const defaultLabel = submitButton.getAttribute("data-default-label");
        const loadingLabel = submitButton.getAttribute("data-loading-label");

        submitButton.textContent = next ? loadingLabel : defaultLabel;

        if (next) {
            submitButton.setAttribute("aria-busy", "true");
        } else {
            submitButton.removeAttribute("aria-busy");
        }
    }
    //Here I create a function to clear field-specific error states and the error summary
    function clearFieldErrors() {
        emailInput.removeAttribute("aria-invalid");
        passwordInput.removeAttribute("aria-invalid");
        errorSummary.hidden = true;
        errorSummaryList.innerHTML = "";
    }
    //Here I create a function to display validation errors for the form fields
    function showValidationErrors(errors) {
        clearFieldErrors();

        const items = [];

        if (errors.email) {
            emailInput.setAttribute("aria-invalid", "true");
            items.push({
                field: "email",
                message: errors.email,
            });
        }

        if (errors.password) {
            passwordInput.setAttribute("aria-invalid", "true");
            items.push({
                field: "password",
                message: errors.password,
            });
        }

        if (!items.length) return;

        errorSummary.hidden = false;
        errorSummaryList.innerHTML = "";

        items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item.message;

            li.addEventListener("click", () => {
                if (item.field === "email") {
                    emailInput.focus();
                } else if (item.field === "password") {
                    passwordInput.focus();
                }
            });

            errorSummaryList.appendChild(li);
        });
        //Here I focus the error summary and the first invalid field for accessibility
        window.requestAnimationFrame(() => {
            errorSummary.focus?.();
            const firstField =
                items[0].field === "email" ? emailInput : passwordInput;
            firstField.focus();
        });
    }
    //Here I create a function to display notifications in the notification region
    function showNotification(message) {
        if (!notificationRegion) return;
        notificationRegion.textContent = message;
    }
    //Here I create the main function to handle form submission
    async function handleSubmit(event) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const emailValue = emailInput.value;
        const passwordValue = passwordInput.value;

        const errors = {
            email: validateEmail(emailValue),
            password: validatePassword(passwordValue),
        };

        if (errors.email || errors.password) {
            showValidationErrors(errors);
            return;
        }

        clearFieldErrors();
        setSubmitting(true);
        //Here I perform the login request to the mock API endpoint
        try {
            const response = await window.fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: emailValue.trim(),
                    password: passwordValue,
                    remember: rememberInput.checked,
                }),
            });

            const data = await response.json();
            //Here I handle the response and display appropriate messages or update the UI on success
            if (!response.ok || !data.ok) {
                if (data.errors) {
                    showValidationErrors(data.errors);
                    showNotification("Please correct the highlighted fields");
                    return;
                }

                showNotification(data.message || "Sign in failed");
                showValidationErrors({
                    email: null,
                    password: "Email or password is not correct",
                });
                return;
            }


            loginView.hidden = true;
            successView.hidden = false;
            //Here I update the welcome message and subtitle with the user's information
            welcomeMessage.textContent = `Signed in as ${data.user.email} on a ${data.user.plan} plan.`;
            if (appSubtitle) {
                appSubtitle.textContent = `Welcome, ${data.user.email}`;
            }
            window.requestAnimationFrame(() => {
                welcomeHeading.focus();
            });
        } catch (error) {
            console.error(error);
            showNotification(
                "We could not reach the server. Please try again in a moment.",
            );
        } finally {
            setSubmitting(false);
        }
    }
    //Here I create a function to toggle the visibility of the password input field
    function handleTogglePassword() {
        const isNowVisible = passwordInput.type === "password";
        passwordInput.type = isNowVisible ? "text" : "password";
        togglePasswordButton.setAttribute("aria-pressed", String(isNowVisible));
        togglePasswordButton.textContent = isNowVisible ? "Hide" : "Show";

        passwordInput.focus();
    }
    //Here I create a function to handle user sign-out and reset the application state
    function handleSignOut() {

        loginForm.reset();
        clearFieldErrors();
        successView.hidden = true;
        loginView.hidden = false;
        showNotification("You have signed out");
        if (appSubtitle) {
            appSubtitle.textContent = defaultSubtitle;
        }
        emailInput.focus();
    }

    loginForm.addEventListener("submit", handleSubmit);
    togglePasswordButton.addEventListener("click", handleTogglePassword);
    signOutButton.addEventListener("click", handleSignOut);

    //Here I add blur event listeners to validate fields on losing focus
    emailInput.addEventListener("blur", () => {
        const message = validateEmail(emailInput.value);
        if (message) {
            emailInput.setAttribute("aria-invalid", "true");
        } else {
            emailInput.removeAttribute("aria-invalid");
        }
    });
    //Here I add blur event listeners to validate fields on losing focus
    passwordInput.addEventListener("blur", () => {
        const message = validatePassword(passwordInput.value);
        if (message) {
            passwordInput.setAttribute("aria-invalid", "true");
        } else {
            passwordInput.removeAttribute("aria-invalid");
        }
    });

    //Here I set focus to the email input field on initial load
    window.requestAnimationFrame(() => {
        emailInput.focus();
    });
}
//Here I ensure the setupLoginApp function runs after the DOM is fully loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupLoginApp);
} else {
    setupLoginApp();
}

