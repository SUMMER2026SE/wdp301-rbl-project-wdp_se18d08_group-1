import { useRef } from "react";

/** 6 ô OTP — mỗi ô một chữ số, tự nhảy sang ô kế khi nhập */
export default function OtpInput({ value, onChange }) {
    const inputRefs = useRef([]);

    const handleChange = (idx, e) => {
        const v = e.target.value;
        if (!/^\d?$/.test(v)) return;
        const digits = value.split("");
        digits[idx] = v.slice(-1);
        onChange(digits.join(""));
        if (v && idx < 5) {
            inputRefs.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === "Backspace" && !value[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        onChange(pasted);
        pasted.split("").forEach((ch, i) => {
            if (inputRefs.current[i]) inputRefs.current[i].value = ch;
        });
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    return (
        <>
            <style>{`
                @keyframes otp-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(229,9,20,0.35); }
                    50% { box-shadow: 0 0 0 8px rgba(229,9,20,0); }
                }
                @keyframes otp-fill {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.12); }
                    100% { transform: scale(1); }
                }
                .otp-filled { animation: otp-fill 0.15s ease-out; }
                .otp-box:focus-within { animation: otp-pulse 1.4s ease-in-out infinite; }
            `}</style>
            <div className="flex flex-col items-center gap-3" onPaste={handlePaste}>
                <div className="flex gap-2.5">
                    {[...Array(6)].map((_, i) => {
                        const filled = Boolean(value[i]);
                        return (
                            <div key={i} className="otp-box relative">
                                <input
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={value[i] || ""}
                                    onChange={(e) => {
                                        const prev = value[i];
                                        handleChange(i, e);
                                        if (e.target.value && !prev) {
                                            e.target.classList.remove("otp-filled");
                                            void e.target.offsetWidth;
                                            e.target.classList.add("otp-filled");
                                        }
                                    }}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className={`
                                        w-12 h-14 text-center text-2xl font-bold rounded-xl
                                        bg-[#141414] border-2 transition-all duration-200
                                        text-white placeholder:text-[#3a3a3a]
                                        focus:outline-none
                                        ${filled
                                            ? "border-[#E50914] text-white"
                                            : "border-[#2e2e2e] text-white"
                                        }
                                        hover:border-[#444]
                                        focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/30
                                    `}
                                />
                            </div>
                        );
                    })}
                </div>
                <p className="text-[#737373] text-xs mt-1">Dán mã từ clipboard</p>
            </div>
        </>
    );
}
