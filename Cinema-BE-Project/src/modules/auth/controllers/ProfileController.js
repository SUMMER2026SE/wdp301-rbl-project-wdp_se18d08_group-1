const { User } = require("../models/User");
const ApiResponse = require("../../../utils/ApiResponse");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

class ProfileController {
    async getProfile(req, res) {
        try {
            if (!req.user?.id) {
                return ApiResponse.error(res, "Unauthorized - invalid token", 401);
            }

            const user = await User.findById(req.user.id).select(
                "-password -resetPasswordOTP -resetPasswordExpires"
            );

            if (!user) {
                return ApiResponse.error(res, "Người dùng không tồn tại", 404);
            }
            return ApiResponse.success(res, user, "Lấy thông tin thành công");
        } catch (e) {
            console.error("getProfile error:", e);
            return ApiResponse.error(res, e.message, 500);
        }
    }

    async updateProfile(req, res) {
        try {
            const { fullName, phoneNumber, avatar, dateOfBirth, gender, address } = req.body;

            const avatarLen = avatar != null ? String(avatar).length : 0;
            console.log(
                "[updateProfile] userId=%s avatar=%s chars keys=%s",
                req.user.id,
                avatarLen || "none",
                Object.keys(req.body || {}).join(",")
            );

            const user = await User.findById(req.user.id);
            if (!user) {
                return ApiResponse.error(res, "Người dùng không tồn tại", 404);
            }

            if (fullName !== undefined) user.fullName = fullName;
            if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
            if (avatar !== undefined) user.avatar = avatar;
            if (dateOfBirth !== undefined && dateOfBirth !== "") {
                user.dateOfBirth = dateOfBirth;
            }
            if (gender !== undefined && gender !== "") {
                user.gender = gender;
            }
            if (address !== undefined) user.address = address;

            await user.save({ validateBeforeSave: true });

            const updated = await User.findById(req.user.id).select(
                "-password -resetPasswordOTP -resetPasswordExpires"
            );

            console.log(
                "[updateProfile] saved avatar=%s chars",
                updated.avatar ? String(updated.avatar).length : 0
            );

            return ApiResponse.success(res, updated, "Cập nhật thông tin thành công", 200);
        } catch (e) {
            console.error("updateProfile error:", e);
            if (e.code === 11000) {
                return ApiResponse.error(res, "Số điện thoại đã được sử dụng", 400);
            }
            return ApiResponse.error(res, e.message, 400);
        }
    }

    /** Upload avatar — lưu file vào uploads/avatars, chỉ lưu URL vào DB */
    async uploadAvatar(req, res) {
        try {
            console.log("[uploadAvatar] req.user:", req.user);
            console.log("[uploadAvatar] req.file:", req.file ? {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                filename: req.file.filename,
                path: req.file.path,
            } : "NO FILE");

            if (!req.file) {
                return ApiResponse.error(res, "Không có file ảnh", 400);
            }

            if (!req.user?.id) {
                return ApiResponse.error(res, "Unauthorized - no user id", 401);
            }

            const user = await User.findById(req.user.id);
            if (!user) {
                return ApiResponse.error(res, "Người dùng không tồn tại", 404);
            }

            console.log("[uploadAvatar] user found:", user._id, "current avatar:", user.avatar);

            // Xóa avatar cũ (chỉ file local)
            if (user.avatar && user.avatar.startsWith("/uploads/")) {
                const oldPath = path.join(__dirname, "..", "..", "..", "..", user.avatar);
                console.log("[uploadAvatar] deleting old avatar:", oldPath);
                fs.unlink(oldPath, () => {});
            }

            // Lưu đường dẫn tương đối vào DB
            const avatarUrl = `/uploads/avatars/${req.file.filename}`;
            user.avatar = avatarUrl;
            await user.save({ validateBeforeSave: true });

            console.log("[uploadAvatar] saved avatarUrl:", avatarUrl);

            const updated = await User.findById(req.user.id).select(
                "-password -resetPasswordOTP -resetPasswordExpires"
            );
            console.log("[uploadAvatar] updated user avatar:", updated.avatar);

            return ApiResponse.success(res, updated, "Cập nhật ảnh đại diện thành công", 200);
        } catch (e) {
            console.error("[uploadAvatar] error:", e);
            return ApiResponse.error(res, e.message || "Upload thất bại", 400);
        }
    }

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return ApiResponse.error(res, "Vui lòng nhập đầy đủ thông tin", 400);
            }

            if (newPassword.length < 6) {
                return ApiResponse.error(res, "Mật khẩu mới phải có ít nhất 6 ký tự", 400);
            }

            const user = await User.findById(req.user.id);
            if (!user) {
                return ApiResponse.error(res, "Người dùng không tồn tại", 404);
            }

            if (!user.password) {
                return ApiResponse.error(res, "Tài khoản Google không thể đổi mật khẩu", 400);
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return ApiResponse.error(res, "Mật khẩu hiện tại không đúng", 400);
            }

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            return ApiResponse.success(res, null, "Đổi mật khẩu thành công");
        } catch (e) {
            return ApiResponse.error(res, e.message, 500);
        }
    }
}

module.exports = ProfileController;
