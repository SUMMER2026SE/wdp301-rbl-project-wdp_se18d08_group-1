import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/AuthContext";
import { useAuthHandlers } from "./hooks/useAuthHandlers";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import VerifyForm from "./components/VerifyForm";
import GoogleButton from "./components/GoogleButton";
import AuthToggle from "./components/AuthToggle";
import { GOOGLE_OAUTH_BROADCAST } from "../../constants/googleOAuth";

export default function AuthModal({ isOpen, onClose, origin }) {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const focusMainContentAfterLogin = useCallback(() => {
        window.setTimeout(() => {
            if (pathname === "/") {
                document.getElementById("movies")?.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                navigate("/", { state: { focusMovies: true } });
            }
        }, 200);
    }, [navigate, pathname]);

    const handleLoginRedirect = useCallback((token) => {
        try {
            const decoded = jwtDecode(token);
            const role = decoded.role;
            if (role === "manager") {
                navigate("/manager/dashboard");
            } else if (role === "admin") {
                navigate("/admin/dashboard");
            } else if (role === "staff") {
                navigate("/staff/dashboard");
            } else {
                focusMainContentAfterLogin();
            }
        } catch (e) {
            focusMainContentAfterLogin();
        }
    }, [navigate, focusMainContentAfterLogin]);

    const onGoogleAuthSuccess = useCallback(
        (token) => {
            if (!token) return;
            login(token);
            onClose();
            const Swal = require("sweetalert2").default;
            Swal.fire({
                icon: "success",
                title: "Đăng nhập thành công!",
                text: "Chào mừng bạn đến với Cinema",
                confirmButtonColor: "#E50914",
                timer: 2000,
                showConfirmButton: false,
            });
            handleLoginRedirect(token);
        },
        [login, onClose, handleLoginRedirect]
    );

    const onGoogleAuthError = useCallback(() => {
        const Swal = require("sweetalert2").default;
        Swal.fire({
            icon: "error",
            title: "Đăng nhập Google thất bại",
            text: "Vui lòng thử lại",
            confirmButtonColor: "#E50914",
        });
    }, []);

    const [mode, setMode] = useState("login");
    const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "", fullName: "" });
    const [otp, setOtp] = useState("");
    const [pendingEmail, setPendingEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const { handleLoginSubmit, handleRegisterSubmit, handleVerifySubmit, handleResend } = useAuthHandlers({
        formData,
        pendingEmail,
        otp,
        loading,
        setLoading,
        setPendingEmail,
        setOtp,
        setResendCooldown,
        setMode,
        login,
        onClose,
        handleLoginRedirect,
    });

    useEffect(() => {
        if (mode !== "verify") {
            setFormData({ email: "", password: "", confirmPassword: "", fullName: "" });
            setOtp("");
        }
    }, [mode]);

    useEffect(() => {
        if (isOpen) {
            setShow(false);
            setMode("login");
            const t = setTimeout(() => setShow(true), 20);
            return () => clearTimeout(t);
        } else {
            setShow(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const h = (e) => { e.key === "Escape" && onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    useEffect(() => {
        const handleMsg = (event) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === "GOOGLE_AUTH_SUCCESS") onGoogleAuthSuccess(event.data.token);
            else if (event.data?.type === "GOOGLE_AUTH_ERROR") onGoogleAuthError();
        };
        window.addEventListener("message", handleMsg);
        return () => window.removeEventListener("message", handleMsg);
    }, [onGoogleAuthSuccess, onGoogleAuthError]);

    useEffect(() => {
        const ch = new BroadcastChannel(GOOGLE_OAUTH_BROADCAST);
        ch.onmessage = (event) => {
            if (event.data?.type === "GOOGLE_AUTH_SUCCESS") onGoogleAuthSuccess(event.data.token);
            else if (event.data?.type === "GOOGLE_AUTH_ERROR") onGoogleAuthError();
        };
        return () => ch.close();
    }, [onGoogleAuthSuccess, onGoogleAuthError]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
        return () => clearInterval(t);
    }, [resendCooldown]);

    const handleChange = (e) => setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
    const handleModeToggle = () => setMode(mode === "login" ? "register" : "login");
    const handleBackToLogin = () => { setMode("login"); setOtp(""); };

    const onResend = async () => {
        if (resendCooldown > 0 || resending) return;
        setResending(true);
        await handleResend(setResending);
        setResending(false);
    };

    const titles = { login: "Đăng nhập", register: "Đăng ký", verify: "Xác thực email" };

    return (
        <div
            onClick={onClose}
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500
            ${show ? "bg-black/80 backdrop-blur-md opacity-100" : "opacity-0 pointer-events-none"}`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "fixed",
                    left: "50%",
                    top: "400%",
                    transformOrigin: origin
                        ? `${origin.x - window.innerWidth / 2 + 200}px ${origin.y - window.innerHeight / 2 + 100}px`
                        : "center",
                }}
                className={`
                    relative w-[90%] max-w-[450px] p-8 md:p-14 rounded-md bg-black/90
                    border border-white/5 shadow-2xl
                    transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    ${show ? "translate-x-[-50%] translate-y-[-50%] scale-100 opacity-100" : "translate-x-[-50%] translate-y-[-50%] scale-0 opacity-0"}
                `}
            >
                <button onClick={onClose} className="absolute right-6 top-6 text-gray-500 hover:text-white transition-colors text-2xl font-light">
                    ✕
                </button>

                <h2 className="text-white text-3xl font-bold mb-6">{titles[mode]}</h2>

                {mode === "login" && (
                    <>
                        <LoginForm
                            formData={formData}
                            onChange={handleChange}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            loading={loading}
                            onSubmit={handleLoginSubmit}
                        />
                        <div className="flex items-center my-6">
                            <div className="flex-1 border-t border-gray-600" />
                            <span className="px-4 text-gray-500 text-sm">Hoặc</span>
                            <div className="flex-1 border-t border-gray-600" />
                        </div>
                        <GoogleButton />
                        <AuthToggle mode={mode} onToggle={handleModeToggle} />
                    </>
                )}

                {mode === "register" && (
                    <>
                        <RegisterForm
                            formData={formData}
                            onChange={handleChange}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            loading={loading}
                            onSubmit={handleRegisterSubmit}
                        />
                        <div className="flex items-center my-6">
                            <div className="flex-1 border-t border-gray-600" />
                            <span className="px-4 text-gray-500 text-sm">Hoặc</span>
                            <div className="flex-1 border-t border-gray-600" />
                        </div>
                        <GoogleButton />
                        <AuthToggle mode={mode} onToggle={handleModeToggle} />
                    </>
                )}

                {mode === "verify" && (
                    <VerifyForm
                        email={pendingEmail}
                        otp={otp}
                        onOtpChange={setOtp}
                        resendCooldown={resendCooldown}
                        resending={resending}
                        loading={loading}
                        onSubmit={handleVerifySubmit}
                        onResend={onResend}
                        onBack={handleBackToLogin}
                    />
                )}
            </div>
        </div>
    );
}
