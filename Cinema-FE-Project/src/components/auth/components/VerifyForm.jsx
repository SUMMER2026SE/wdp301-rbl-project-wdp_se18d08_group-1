import OtpInput from "./OtpInput";

export default function VerifyForm({
    email,
    otp,
    onOtpChange,
    resendCooldown,
    resending,
    loading,
    onSubmit,
    onResend,
    onBack,
}) {
    return (
        <div className="space-y-8">
            {/* Icon + heading */}
            <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E50914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </div>
                <div className="text-center">
                    <h3 className="text-white text-xl font-semibold">Xác thực email</h3>
                    <p className="text-[#737373] text-sm mt-1">
                        Mã OTP đã được gửi đến<br />
                        <span className="text-[#aaa] font-medium">{email}</span>
                    </p>
                </div>
            </div>

            {/* OTP input + submit */}
            <form onSubmit={onSubmit} className="space-y-6">
                <OtpInput value={otp} onChange={onOtpChange} />

                <div className="flex flex-col items-center gap-2">
                    <button
                        disabled={loading || otp.length !== 6}
                        type="submit"
                        className="w-full bg-[#E50914] text-white py-3.5 rounded font-semibold hover:bg-[#c10712] transition-all shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                                </svg>
                                Đang xác thực...
                            </span>
                        ) : "Xác thực"}
                    </button>

                    {/* Countdown + resend */}
                    <div className="flex flex-col items-center gap-1.5 w-full pt-1">
                        {resendCooldown > 0 ? (
                            <>
                                <div className="w-full bg-[#1e1e1e] rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="h-full bg-[#E50914] rounded-full transition-all duration-1000 ease-linear"
                                        style={{ width: `${(resendCooldown / 60) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[#737373] text-xs">Gửi lại sau {resendCooldown}s</p>
                            </>
                        ) : (
                            <button
                                type="button"
                                disabled={resending}
                                onClick={onResend}
                                className="text-[#aaa] hover:text-[#E50914] text-xs transition-colors disabled:opacity-40"
                            >
                                {resending ? "Đang gửi..." : "Không nhận được mã? Gửi lại"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Back to login */}
                <button
                    type="button"
                    onClick={onBack}
                    className="w-full text-center text-[#737373] hover:text-white text-sm transition-colors py-1"
                >
                    ← Quay lại đăng nhập
                </button>
            </form>
        </div>
    );
}
