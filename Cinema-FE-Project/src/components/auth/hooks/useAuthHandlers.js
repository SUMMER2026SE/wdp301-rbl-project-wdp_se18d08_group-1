import { useCallback } from "react";
import Swal from "sweetalert2";
import { login as loginApi, register, verifyEmail, resendVerifyEmail } from "../../../services/authService";

export function useAuthHandlers({
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
}) {
    const handleLoginSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
                const res = await loginApi({ email: formData.email, password: formData.password });
                const token = res.data.token;
                login(token);
                onClose();
                handleLoginRedirect(token);
            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title: "Đăng nhập thất bại",
                    text: err.message,
                    confirmButtonColor: "#E50914",
                });
            } finally {
                setLoading(false);
            }
        },
        [formData, login, onClose, handleLoginRedirect, setLoading]
    );

    const handleRegisterSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (formData.password !== formData.confirmPassword) {
                return Swal.fire({
                    icon: "warning",
                    title: "Mật khẩu không khớp",
                    text: "Vui lòng nhập lại mật khẩu xác nhận",
                    confirmButtonColor: "#E50914",
                });
            }
            setLoading(true);
            try {
                await register({ email: formData.email, password: formData.password, fullName: formData.fullName });
                setPendingEmail(formData.email);
                setOtp("");
                setResendCooldown(60);
                setMode("verify");
            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title: "Đăng ký thất bại",
                    text: err.message,
                    confirmButtonColor: "#E50914",
                });
            } finally {
                setLoading(false);
            }
        },
        [formData, setLoading, setPendingEmail, setOtp, setResendCooldown, setMode]
    );

    const handleVerifySubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (otp.length !== 6) {
                return Swal.fire({
                    icon: "warning",
                    title: "Mã OTP không hợp lệ",
                    text: "Vui lòng nhập đủ 6 chữ số",
                    confirmButtonColor: "#E50914",
                });
            }
            setLoading(true);
            try {
                const res = await verifyEmail({ email: pendingEmail, otp });
                Swal.fire({
                    icon: "success",
                    title: "Xác thực thành công!",
                    text: res.data?.message || res.message || "Bạn có thể đăng nhập ngay bây giờ",
                    confirmButtonColor: "#E50914",
                });
                const token = res.data?.accessToken || res.accessToken;
                if (token) {
                    login(token);
                    onClose();
                    handleLoginRedirect(token);
                } else {
                    setMode("login");
                }
            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title: "Xác thực thất bại",
                    text: err.message,
                    confirmButtonColor: "#E50914",
                });
            } finally {
                setLoading(false);
            }
        },
        [otp, pendingEmail, login, onClose, handleLoginRedirect, setLoading, setMode]
    );


    const handleResend = useCallback(
        async (setResending) => {
            try {
                const res = await resendVerifyEmail(pendingEmail);
                Swal.fire({
                    icon: "success",
                    title: "Đã gửi lại mã OTP",
                    text: res.message,
                    confirmButtonColor: "#E50914",
                });
                setResendCooldown(60);
            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title: "Gửi lại thất bại",
                    text: err.message,
                    confirmButtonColor: "#E50914",
                });
            }
        },
        [pendingEmail, setResendCooldown]
    );

    return { handleLoginSubmit, handleRegisterSubmit, handleVerifySubmit, handleResend };
}
