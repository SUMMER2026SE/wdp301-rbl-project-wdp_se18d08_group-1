export default function AuthToggle({ mode, onToggle }) {
    const isRegister = mode === "register";
    return (
        <div className="mt-6">
            <p className="text-[#737373]">
                {isRegister ? "Đã có tài khoản?" : "Bạn mới tham gia ứng dụng?"}
                <span
                    onClick={onToggle}
                    className="text-white cursor-pointer ml-2 hover:underline font-medium"
                >
                    {isRegister ? "Đăng nhập ngay" : "Đăng ký ngay."}
                </span>
            </p>
        </div>
    );
}
