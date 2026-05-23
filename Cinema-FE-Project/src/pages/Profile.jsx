import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile, uploadProfileAvatar, changePassword } from "../services/profileService";
import Swal from "sweetalert2";

const API_BASE =
    process.env.BACKEND_URL?.replace(/\/$/, "") || "https://cinema-ticket-booking-system-3.onrender.com";

function getAvatarUrl(avatar) {
    if (!avatar) return `${API_BASE}/uploads/default-avatar.svg`;
    if (avatar.startsWith("data:")) return avatar;
    if (avatar.startsWith("http")) return avatar;
    return `${API_BASE}${avatar}`;
}

export default function Profile() {
    const { user, updateUser, refreshUser, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [isEditing, setIsEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isLocalAvatar, setIsLocalAvatar] = useState(false);
    const isSavingRef = useRef(false);

    /** File ảnh chọn từ máy — upload multipart, không nhét base64 vào JSON */
    const localAvatarFileRef = useRef(null);
    const previewBlobUrlRef = useRef(null);

    const [profileData, setProfileData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        avatar: "",
        role: "",
        authProvider: "",
        createdAt: "",
        dateOfBirth: "",
        gender: "",
        address: "",
    });

    const [editData, setEditData] = useState({});

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const toDateInputValue = (value) => {
        if (!value) return "";
        const d = new Date(value);
        if (isNaN(d.getTime())) return "";
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user?.token) {
            navigate("/");
            return;
        }

        const data = {
            fullName: user.fullName || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            avatar: user.avatar || "",
            role: user.role || "",
            authProvider: user.authProvider || "",
            createdAt: user.createdAt || "",
            dateOfBirth: toDateInputValue(user.dateOfBirth),
            gender: user.gender || "",
            address: user.address || "",
        };
        setProfileData(data);
        // Chỉ reset editData khi KHÔNG đang save (tránh race condition với refreshUser)
        if (!isSavingRef.current) {
            setEditData(data);
            setAvatarPreview(user.avatar || null);
            setIsLocalAvatar(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user?.token]);

    // Sync avatarPreview khi user.avatar thay đổi từ bên ngoài (VD: sau khi save thành công)
    useEffect(() => {
        // Nếu đang dùng ảnh local (blob) → không đụng
        if (isLocalAvatar) return;
        // Luôn đồng bộ: null/undefined → hiển thị default; có avatar → hiển thị avatar
        setAvatarPreview(user?.avatar ?? null);
    }, [user?.avatar, isLocalAvatar]);

    useEffect(() => {
        return () => {
            if (previewBlobUrlRef.current) {
                URL.revokeObjectURL(previewBlobUrlRef.current);
                previewBlobUrlRef.current = null;
            }
        };
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: "warning",
                    title: "File quá lớn",
                    text: "Vui lòng chọn file nhỏ hơn 5MB",
                    confirmButtonColor: "#E50914",
                });
                return;
            }
            if (previewBlobUrlRef.current) {
                URL.revokeObjectURL(previewBlobUrlRef.current);
                previewBlobUrlRef.current = null;
            }
            localAvatarFileRef.current = file;
            const url = URL.createObjectURL(file);
            previewBlobUrlRef.current = url;
            setAvatarPreview(url);
            setIsLocalAvatar(true);
        }
        e.target.value = "";
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancelEdit = () => {
        setEditData(profileData);
        if (previewBlobUrlRef.current) {
            URL.revokeObjectURL(previewBlobUrlRef.current);
            previewBlobUrlRef.current = null;
        }
        localAvatarFileRef.current = null;
        if (profileData.avatar) {
            setAvatarPreview(profileData.avatar);
        } else {
            setAvatarPreview(null);
        }
        setIsLocalAvatar(false);
        setIsEditing(false);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        isSavingRef.current = true;
        setSaving(true);
        try {
            let latestUser = null;

            console.log("localAvatarFileRef.current:", localAvatarFileRef.current);
            console.log("avatarPreview:", avatarPreview ? `${avatarPreview.length} chars` : "null");
            console.log("isLocalAvatar:", isLocalAvatar);

            if (localAvatarFileRef.current) {
                console.log("Uploading avatar...");
                const up = await uploadProfileAvatar(localAvatarFileRef.current);
                console.log("Upload result:", JSON.stringify(up, null, 2));
                if (!up.success || !up.data) {
                    throw new Error(up.message || "Upload ảnh thất bại");
                }
                latestUser = up.data;
                updateUser(up.data);
                if (previewBlobUrlRef.current) {
                    URL.revokeObjectURL(previewBlobUrlRef.current);
                    previewBlobUrlRef.current = null;
                }
                localAvatarFileRef.current = null;
            }

            const payload = {
                fullName: editData.fullName,
                phoneNumber: editData.phoneNumber,
                dateOfBirth: editData.dateOfBirth,
                gender: editData.gender,
                address: editData.address,
            };

            const res = await updateProfile(payload);
            console.log("PUT profile result:", JSON.stringify(res, null, 2));

            if (res.success && res.data) {
                latestUser = res.data;
                updateUser(res.data);
                await refreshUser();
                console.log("After refreshUser, latestUser.avatar:", latestUser?.avatar ? `${String(latestUser.avatar).length} chars` : "null");
                setProfileData((prev) => ({
                    ...prev,
                    ...editData,
                    avatar: res.data.avatar || prev.avatar,
                }));
                setIsEditing(false);
                setIsLocalAvatar(false);
                setAvatarPreview(latestUser?.avatar || res.data.avatar || null);
                console.log("setAvatarPreview called with:", (latestUser?.avatar || res.data.avatar || null) ? "has value" : "null");
                Swal.fire({
                    icon: "success",
                    title: "Thành công",
                    text: res.message || "Cập nhật thông tin thành công",
                    confirmButtonColor: "#E50914",
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                console.error("Update failed! res:", res);
                throw new Error(res.message || "Cập nhật thất bại");
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: err.response?.data?.message || err.message || "Cập nhật thất bại",
                confirmButtonColor: "#E50914",
            });
        } finally {
            setSaving(false);
            isSavingRef.current = false;
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: "", color: "" };
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const levels = [
            { label: "Rất yếu", color: "bg-red-500" },
            { label: "Yếu", color: "bg-orange-500" },
            { label: "Trung bình", color: "bg-yellow-500" },
            { label: "Mạnh", color: "bg-green-500" },
            { label: "Rất mạnh", color: "bg-emerald-500" },
        ];
        return { strength, ...levels[strength] };
    };

    const passwordStrength = getPasswordStrength(passwordData.newPassword);

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword.length < 6) {
            return Swal.fire({
                icon: "warning",
                title: "Cảnh báo",
                text: "Mật khẩu mới phải có ít nhất 6 ký tự",
                confirmButtonColor: "#E50914",
            });
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return Swal.fire({
                icon: "warning",
                title: "Cảnh báo",
                text: "Mật khẩu xác nhận không khớp",
                confirmButtonColor: "#E50914",
            });
        }

        setSaving(true);
        try {
            await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            Swal.fire({
                icon: "success",
                title: "Thành công",
                text: "Đổi mật khẩu thành công",
                confirmButtonColor: "#E50914",
            });
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: err.response?.data?.message || "Đổi mật khẩu thất bại",
                confirmButtonColor: "#E50914",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Swal.fire({
            icon: "question",
            title: "�ăng xuất",
            text: "Bạn có chắc muốn đăng xuất?",
            confirmButtonColor: "#E50914",
            showCancelButton: true,
            confirmButtonText: "Đăng xuất",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                navigate("/");
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa cập nhật";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return "Chưa cập nhật";
            return d.toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return "Chưa cập nhật";
        }
    };

    const getRoleLabel = (role) => {
        const labels = {
            customer: "Khách hàng",
            admin: "Quản trị viên",
            manager: "Quản lý",
            staff: "Nhân viên",
        };
        return labels[role] || role;
    };

    const getGenderLabel = (gender) => {
        const labels = { male: "Nam", female: "Nữ", other: "Khác" };
        return labels[gender] || "Chưa cập nhật";
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a0a0a] pt-20 pb-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header — gọn, chỉ avatar + thông tin + badge */}
                <div className="mb-8 rounded-2xl border border-[#E50914]/35 bg-gradient-to-br from-[#E50914]/[0.12] via-black/40 to-black/80 p-6 md:p-7 shadow-[0_0_40px_-12px_rgba(229,9,20,0.35)] relative overflow-hidden">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E50914]/15 blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 left-1/4 h-24 w-64 bg-[#E50914]/10 blur-2xl rounded-full" />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 relative z-10">
                        {/* Avatar */}
                        <div className="relative group shrink-0 mx-auto sm:mx-0">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#E50914] to-[#b30710] p-[3px] shadow-lg shadow-red-900/40 ring-1 ring-white/10">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-3xl sm:text-4xl font-bold overflow-hidden">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                            onError={() => setAvatarPreview(null)}
                                        />
                                    ) : (
                                        <img
                                            src={getAvatarUrl(profileData.avatar)}
                                            alt="Default avatar"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                const initial = (profileData.fullName || profileData.email || "U").charAt(0).toUpperCase();
                                                const span = document.createElement("span");
                                                span.textContent = initial;
                                                span.className = "text-white text-3xl sm:text-4xl font-bold";
                                                e.target.parentElement.appendChild(span);
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={triggerFileInput}
                                className="absolute bottom-0 right-0 w-10 h-10 bg-[#E50914] rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
                                {profileData.fullName || "Người dùng"}
                            </h1>
                            <p className="text-sm text-gray-400 mb-3 truncate sm:whitespace-normal">{profileData.email}</p>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                <span className="px-3 py-1 bg-[#E50914]/15 text-[#E50914] text-xs sm:text-sm font-semibold rounded-lg border border-[#E50914]/40">
                                    {getRoleLabel(profileData.role)}
                                </span>
                                {profileData.authProvider === "google" && (
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-300 text-xs sm:text-sm font-medium rounded-lg border border-blue-500/25 inline-flex items-center gap-1.5">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Google
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-white/5 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-white/10 max-w-md mx-auto">
                    <button
                        onClick={() => { setActiveTab("overview"); setIsEditing(false); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === "overview"
                            ? "bg-[#E50914] text-white shadow-lg shadow-red-900/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tổng quan
                    </button>
                    <button
                        onClick={() => { setActiveTab("security"); setIsEditing(false); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === "security"
                            ? "bg-[#E50914] text-white shadow-lg shadow-red-900/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Bảo mật
                    </button>
                </div>

                {/* Content */}
                <div className="max-w-2xl mx-auto">
                    {activeTab === "overview" && (
                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
                            {!isEditing ? (
                                /* View Mode */
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                            <svg className="w-6 h-6 text-[#E50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Thông tin tài khoản
                                        </h2>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#E50914] hover:bg-[#f40612] text-white rounded-xl font-medium transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Chỉnh sửa
                                        </button>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <InfoCard label="Họ và tên" value={profileData.fullName || "Chưa cập nhật"} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        <InfoCard label="Email" value={profileData.email} icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        <InfoCard label="Số điện thoại" value={profileData.phoneNumber || "Chưa cập nhật"} icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        <InfoCard label="Ngày sinh" value={formatDate(profileData.dateOfBirth)} icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        <InfoCard label="Giới tính" value={getGenderLabel(profileData.gender)} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        <InfoCard label="Địa chỉ" value={profileData.address || "Chưa cập nhật"} icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <InfoCard label="Thành viên từ" value={formatDate(profileData.createdAt)} icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </div>
                                </div>
                            ) : (
                                /* Edit Mode */
                                <form onSubmit={handleSaveProfile}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                            <svg className="w-6 h-6 text-[#E50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Chỉnh sửa thông tin
                                        </h2>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="flex items-center gap-2 px-4 py-2 bg-[#E50914] hover:bg-[#f40612] text-white rounded-xl font-medium transition-all disabled:opacity-50"
                                            >
                                                {saving ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Đang lưu...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Lưu
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Họ và tên</label>
                                            <input
                                                name="fullName"
                                                type="text"
                                                value={editData.fullName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Số điện thoại</label>
                                            <input
                                                name="phoneNumber"
                                                type="tel"
                                                value={editData.phoneNumber}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Ngày sinh</label>
                                            <input
                                                name="dateOfBirth"
                                                type="date"
                                                value={editData.dateOfBirth}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Giới tính</label>
                                            <select
                                                name="gender"
                                                value={editData.gender}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 transition-all"
                                            >
                                                <option value="" className="bg-gray-900">Chọn giới tính</option>
                                                <option value="male" className="bg-gray-900">Nam</option>
                                                <option value="female" className="bg-gray-900">Nữ</option>
                                                <option value="other" className="bg-gray-900">Khác</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Địa chỉ</label>
                                            <input
                                                name="address"
                                                type="text"
                                                value={editData.address}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-[#E50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Đổi mật khẩu
                            </h2>

                            {profileData.authProvider === "google" ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-white text-xl font-semibold mb-3">Tài khoản Google</h3>
                                    <p className="text-gray-400 max-w-md mx-auto">
                                        Bạn đang đăng nhập bằng tài khoản Google.<br />
                                        Không cần đặt mật khẩu cho tài khoản này.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Mật khẩu hiện tại</label>
                                        <input
                                            name="currentPassword"
                                            type={showPassword.current ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 transition-all pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((p) => ({ ...p, current: !p.current }))}
                                            className="absolute right-4 top-[38px] text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword.current ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Mật khẩu mới</label>
                                        <input
                                            name="newPassword"
                                            type={showPassword.new ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 transition-all pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((p) => ({ ...p, new: !p.new }))}
                                            className="absolute right-4 top-[38px] text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword.new ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                        {passwordData.newPassword && (
                                            <div className="mt-2">
                                                <div className="flex gap-1 mb-1">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={`h-1 flex-1 rounded-full transition-all ${level <= passwordStrength.strength
                                                                ? passwordStrength.color
                                                                : "bg-white/10"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className={`text-xs ${passwordStrength.strength >= 3 ? "text-green-400" : "text-yellow-400"}`}>
                                                    {passwordStrength.label}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Xác nhận mật khẩu mới</label>
                                        <input
                                            name="confirmPassword"
                                            type={showPassword.confirm ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 transition-all pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((p) => ({ ...p, confirm: !p.confirm }))}
                                            className="absolute right-4 top-[38px] text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword.confirm ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full bg-gradient-to-r from-[#E50914] to-[#b30710] text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                Đổi mật khẩu
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Logout Button */}
                    <div className="mt-8 text-center max-w-2xl mx-auto">
                        <button
                            onClick={handleLogout}
                            className="px-8 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-medium transition-all inline-flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ label, value, icon }) {
    return (
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
                {label}
            </div>
            <p className="text-white font-medium">{value}</p>
        </div>
    );
}
