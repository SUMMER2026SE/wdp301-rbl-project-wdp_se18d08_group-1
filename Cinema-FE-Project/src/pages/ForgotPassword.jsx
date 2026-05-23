import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NetflixInput from "../components/common/Input/NetflixInput";
import {
    requestResetPassword,
    resetPassword,
} from "../services/forgotPasswordService";
import Swal from "sweetalert2";

const STEPS = { EMAIL: 0, OTP: 1, PASSWORD: 2 };
const STEP_LABELS = ["Email", "Xác nhận", "Mật khẩu"];

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const prefillEmail = searchParams.get("email") || "";

    const [step, setStep] = useState(STEPS.EMAIL);
    const [email, setEmail] = useState(prefillEmail);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const otpRefs = Array.from({ length: 6 }, () => ({ current: null }));

    useEffect(() => {
        let t;
        if (countdown > 0) {
            t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        }
        return () => clearTimeout(t);
    }, [countdown]);

    useEffect(() => {
        if (step === STEPS.OTP) {
            setTimeout(() => otpRefs[0]?.current?.focus(), 100);
        }
    }, [step]);

    const handleSendOtp = async (e) => {
        e?.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        try {
            await requestResetPassword(email);
            setStep(STEPS.OTP);
            setCountdown(60);
            Swal.fire({
                icon: "success",
                title: "Đã gửi mã OTP",
                text: "Vui lòng kiểm tra hộp thư email của bạn",
                confirmButtonColor: "#E50914",
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Gửi thất bại",
                text: err.response?.data?.message || err.message,
                confirmButtonColor: "#E50914",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (idx, val) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otp];
        next[idx] = val;
        setOtp(next);
        if (val && idx < 5) {
            setTimeout(() => otpRefs[idx + 1]?.current?.focus(), 0);
        }
    };

    const handleOtpKeyDown = (idx, e) => {
        if (e.key === "Backspace" && !otp[idx] && idx > 0) {
            setTimeout(() => otpRefs[idx - 1]?.current?.focus(), 0);
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        const next = Array(6).fill("");
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
        setOtp(next);
        setTimeout(() => otpRefs[Math.min(pasted.length, 5)]?.current?.focus(), 0);
    };

    const handleVerifyOtp = () => {
        const code = otp.join("");
        if (code.length < 6) {
            return Swal.fire({
                icon: "warning",
                title: "Chưa nhập đủ mã",
                text: "Vui lòng nhập đủ 6 chữ số",
                confirmButtonColor: "#E50914",
            });
        }
        setStep(STEPS.PASSWORD);
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;
        setOtp(Array(6).fill(""));
        await handleSendOtp();
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            return Swal.fire({
                icon: "warning",
                title: "Mật khẩu quá ngắn",
                text: "Mật khẩu phải có ít nhất 6 ký tự",
                confirmButtonColor: "#E50914",
            });
        }
        if (newPassword !== confirmPassword) {
            return Swal.fire({
                icon: "warning",
                title: "Mật khẩu không khớp",
                confirmButtonColor: "#E50914",
            });
        }
        setLoading(true);
        try {
            await resetPassword({ email, otp: otp.join(""), newPassword });
            await Swal.fire({
                icon: "success",
                title: "Đặt lại mật khẩu thành công!",
                text: "Bạn có thể đăng nhập ngay bây giờ",
                confirmButtonColor: "#E50914",
            });
            navigate("/");
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Thất bại",
                text: err.response?.data?.message || err.message,
                confirmButtonColor: "#E50914",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (setter) => (e) => setter(e.target.value);

    const currentStepIndex = step;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a0a0a] px-4">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E50914]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#E50914]/3 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-[420px] p-8 md:p-10 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-red-900/10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#E50914] to-[#b30710] mb-4 shadow-lg shadow-red-900/30">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                        </svg>
                    </div>
                    <h1 className="text-[#E50914] text-2xl font-bold tracking-tight">Cinema</h1>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {STEPS.EMAIL !== STEPS.PASSWORD && STEP_LABELS.map((label, idx) => (
                        <div key={idx} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300 ${
                                idx <= currentStepIndex
                                    ? "bg-[#E50914] text-white shadow-lg shadow-red-900/30"
                                    : "bg-white/10 text-gray-500"
                            }`}>
                                {idx < currentStepIndex ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : idx + 1}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${
                                idx <= currentStepIndex ? "text-white" : "text-gray-500"
                            }`}>
                                {label}
                            </span>
                            {idx < STEP_LABELS.length - 1 && (
                                <div className={`w-8 h-px mx-3 transition-colors duration-300 ${
                                    idx < currentStepIndex ? "bg-[#E50914]" : "bg-white/20"
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Title */}
                <div className="text-center mb-6">
                    <h2 className="text-white text-xl font-semibold">
                        {step === STEPS.EMAIL && "Khôi phục mật khẩu"}
                        {step === STEPS.OTP && "Nhập mã xác nhận"}
                        {step === STEPS.PASSWORD && "Đặt mật khẩu mới"}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {step === STEPS.EMAIL && "Nhập email đã đăng ký để nhận mã OTP"}
                        {step === STEPS.OTP && `Mã đã gửi đến ${email}`}
                        {step === STEPS.PASSWORD && "Nhập mật khẩu mới cho tài khoản của bạn"}
                    </p>
                </div>

                {/* ─── Step 1: Enter email ─── */}
                {step === STEPS.EMAIL && (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <NetflixInput
                            label="Email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={handleChange(setEmail)}
                            placeholder="Nhập email đã đăng ký"
                        />
                        <button
                            type="submit"
                            disabled={loading || !email.trim()}
                            className="w-full bg-[#E50914] text-white py-3.5 rounded-lg font-semibold 
                                hover:bg-[#f40612] active:scale-[0.98] transition-all shadow-lg shadow-red-900/20
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#E50914]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    Đang gửi...
                                </span>
                            ) : "Gửi mã xác nhận"}
                        </button>
                    </form>
                )}

                {/* ─── Step 2: Enter OTP ─── */}
                {step === STEPS.OTP && (
                    <div className="space-y-6">
                        {/* OTP inputs */}
                        <div className="flex justify-center gap-2 md:gap-3" onPaste={handleOtpPaste}>
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={otpRefs[idx]}
                                    type="text"
                                    inputMode="numeric"
                                    value={digit}
                                    maxLength={1}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                    className="w-11 h-14 md:w-12 md:h-14 text-center text-xl md:text-2xl font-bold 
                                        bg-[#141414] border-2 border-white/20 rounded-lg text-white
                                        focus:border-[#E50914] focus:bg-[#1a1a1a] focus:outline-none
                                        transition-all duration-200 shadow-inner"
                                    style={{ caretColor: '#E50914' }}
                                />
                            ))}
                        </div>

                        {/* Countdown Timer */}
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-[#E50914] to-[#f40612] transition-all duration-1000 ease-linear"
                                    style={{ width: `${(countdown / 60) * 100}%` }}
                                />
                            </div>
                            <span className="text-sm font-mono text-gray-400 min-w-[40px]">
                                {countdown}s
                            </span>
                        </div>

                        <button
                            onClick={handleVerifyOtp}
                            className="w-full bg-[#E50914] text-white py-3.5 rounded-lg font-semibold 
                                hover:bg-[#f40612] active:scale-[0.98] transition-all shadow-lg shadow-red-900/20"
                        >
                            Xác nhận mã OTP
                        </button>

                        <div className="flex items-center justify-between text-sm">
                            <button
                                onClick={() => setStep(STEPS.EMAIL)}
                                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Đổi email
                            </button>
                            <button
                                onClick={handleResendOtp}
                                disabled={countdown > 0 || loading}
                                className="text-[#E50914] hover:text-[#f40612] font-medium transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
                            >
                                {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Step 3: New password ─── */}
                {step === STEPS.PASSWORD && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <NetflixInput
                            label="Mật khẩu mới"
                            name="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={handleChange(setNewPassword)}
                            showEye={true}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            placeholder="Ít nhất 6 ký tự"
                        />
                        <NetflixInput
                            label="Xác nhận mật khẩu"
                            name="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={handleChange(setConfirmPassword)}
                            showEye={true}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#E50914] text-white py-3.5 rounded-lg font-semibold 
                                hover:bg-[#f40612] active:scale-[0.98] transition-all shadow-lg shadow-red-900/20
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : "Đặt lại mật khẩu"}
                        </button>
                    </form>
                )}

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-black/80 text-gray-500">hoặc</span>
                    </div>
                </div>

                {/* Back to login */}
                <div className="text-center">
                    <p className="text-gray-400 text-sm">
                        Nhớ mật khẩu rồi?{" "}
                        <button
                            onClick={() => navigate("/")}
                            className="text-[#E50914] hover:text-[#f40612] font-medium transition-colors"
                        >
                            Đăng nhập ngay
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
