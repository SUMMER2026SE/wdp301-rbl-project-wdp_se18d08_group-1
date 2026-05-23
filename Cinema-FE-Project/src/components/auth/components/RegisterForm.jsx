import NetflixInput from "../../common/Input/NetflixInput";

export default function RegisterForm({ formData, onChange, showPassword, setShowPassword, loading, onSubmit }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <NetflixInput
                label="Họ và tên"
                name="fullName"
                value={formData.fullName}
                onChange={onChange}
            />
            <NetflixInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={onChange}
            />
            <NetflixInput
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password}
                onChange={onChange}
                showEye={true}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />
            <NetflixInput
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={onChange}
                showEye={true}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />
            <button
                disabled={loading}
                type="submit"
                className="w-full bg-[#E50914] text-white py-3.5 rounded font-semibold hover:bg-[#c10712] transition-all mt-4 shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
        </form>
    );
}
