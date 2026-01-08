import { useState, useEffect } from "react";
import { IoMdColorFilter, IoMdCheckmark, IoMdClose } from "react-icons/io";

import * as yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { Input, Button } from "../../components";
import type { UpdateUserProfileData } from "../../types";

const profileSchema = yup.object().shape({
  fullName: yup.string(),
  phone: yup.string().matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
  address: yup.string(),
  email: yup.string().email("Email không hợp lệ"),
});

export default function UserProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserProfileData>({
    fullName: "",
    phone: "",
    address: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
    setSuccessMessage("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
        email: user.email || "",
      });
    }
    setErrors({});
    setSuccessMessage("");
  };

  const handleChange = (field: keyof UpdateUserProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    try {
      await profileSchema.validate(formData, { abortEarly: false });
      if (!user) return;

      setIsLoading(true);
      await updateUser(formData);
      setIsEditing(false);
      setSuccessMessage("Cập nhật thông tin thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      } else if (err instanceof Error) {
        setErrors({ submit: err.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  if (!user) {
    return (
      <div className="w-full h-full p-4 md:p-6 overflow-y-auto overflow-x-hidden">
        <div className={`${themeClasses.text} text-2xl md:text-3xl mb-6`}>
          Thông tin cá nhân
        </div>
        <div className={themeClasses.text}>Đang tải thông tin...</div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="w-full h-full p-4 md:p-6 overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className={`${themeClasses.text} text-2xl md:text-3xl font-bold`}>
          Thông tin cá nhân
        </div>
        {!isEditing && (
          <Button
            variant="primary"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <IoMdColorFilter size={20} />
            <span>Chỉnh sửa</span>
          </Button>
        )}
      </div>

      {successMessage && (
        <div
          className={`mb-4 p-3 rounded ${
            theme === "light"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-green-900/30 border border-green-500 text-green-300"
          }`}
        >
          {successMessage}
        </div>
      )}

      <div
        className={`${themeClasses.container} rounded-xl shadow-2xl p-6 max-w-2xl`}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                ID người dùng
              </label>
              <div
                className={`${themeClasses.text} ${
                  theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
                } px-4 py-2 rounded-lg`}
              >
                {user.id}
              </div>
            </div>

            <div>
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                Tên người dùng
              </label>
              <div
                className={`${themeClasses.text} ${
                  theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
                } px-4 py-2 rounded-lg`}
              >
                {user.username}
              </div>
            </div>

            <div>
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                Vai trò
              </label>
              <div className={themeClasses.text}>
                <span
                  className={`px-3 py-1 rounded-full text-sm inline-block ${
                    user.role === "admin"
                      ? theme === "light"
                        ? "bg-indigo-500/20 text-indigo-600"
                        : "bg-indigo-500/20 text-indigo-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                </span>
              </div>
            </div>

            <div>
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                Họ và tên
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Nhập họ và tên"
                  error={errors.fullName}
                />
              ) : (
                <div
                  className={`${themeClasses.text} ${
                    theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
                  } px-4 py-2 rounded-lg`}
                >
                  {user.fullName || "Chưa cập nhật"}
                </div>
              )}
            </div>

            <div>
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Nhập email"
                  error={errors.email}
                />
              ) : (
                <div
                  className={`${themeClasses.text} ${
                    theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
                  } px-4 py-2 rounded-lg`}
                >
                  {user.email}
                </div>
              )}
            </div>

            <div>
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                Số điện thoại
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Nhập số điện thoại"
                  error={errors.phone}
                />
              ) : (
                <div
                  className={`${themeClasses.text} ${
                    theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
                  } px-4 py-2 rounded-lg`}
                >
                  {user.phone || "Chưa cập nhật"}
                </div>
              )}
            </div>

            <div>
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                Địa chỉ
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Nhập địa chỉ"
                  error={errors.address}
                />
              ) : (
                <div
                  className={`${themeClasses.text} ${
                    theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
                  } px-4 py-2 rounded-lg`}
                >
                  {user.address || "Chưa cập nhật"}
                </div>
              )}
            </div>

            <div>
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                Ngày tạo tài khoản
              </label>
              <div
                className={`${themeClasses.text} ${
                  theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
                } px-4 py-2 rounded-lg`}
              >
                {formatDate(user.createdAt)}
              </div>
            </div>

            <div>
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                Lần đăng nhập cuối
              </label>
              <div
                className={`${themeClasses.text} ${
                  theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
                } px-4 py-2 rounded-lg`}
              >
                {formatDate(user.lastLogin)}
              </div>
            </div>
          </div>

          {errors.submit && (
            <div
              className={`mt-4 p-3 rounded ${
                theme === "light"
                  ? "bg-red-100 border border-red-400 text-red-700"
                  : "bg-red-900/30 border border-red-500 text-red-300"
              }`}
            >
              {errors.submit}
            </div>
          )}

          {isEditing && (
            <div
              className={`flex justify-end gap-3 mt-6 pt-6 border-t ${themeClasses.border}`}
            >
              <Button
                variant="secondary"
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <IoMdClose size={20} />
                <span>Hủy</span>
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <IoMdCheckmark size={20} />
                <span>{isLoading ? "Đang lưu..." : "Lưu thay đổi"}</span>
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
