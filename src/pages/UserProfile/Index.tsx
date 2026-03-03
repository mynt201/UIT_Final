import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IoMdColorFilter, IoMdCheckmark, IoMdClose } from "react-icons/io";
import { useFormik } from "formik";
import toast from "react-hot-toast";

import * as yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { formatDate } from "../../utils/formatUtils";
import { Input, Button } from "../../components";
import { getRoleLabel, UserRole } from "../../constants/roles";

export default function UserProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const profileSchema = yup.object().shape({
    full_name: yup.string(),
    email: yup.string().email(t("profile.emailInvalid")),
  });

  const formik = useFormik({
    initialValues: {
      full_name: "",
      email: "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (!user) return;

        await updateUser(values);
        toast.success(t("profile.updateSuccess"));
        setIsEditing(false);
      } catch (err) {
        console.error("Update failed:", err);
        toast.error(t("profile.updateFailed"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (user) {
      formik.setValues({
        full_name: user.full_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    formik.setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      formik.setValues({
        full_name: user.full_name || "",
        email: user.email || "",
      });
    }
    formik.setErrors({});
  };



  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  if (!user) {
    return (
      <div className="w-full h-full p-4 md:p-6 overflow-y-auto overflow-x-hidden">
        <div className={`${themeClasses.text} text-2xl md:text-3xl mb-6`}>
          {t("profile.title")}
        </div>
        <div className={themeClasses.text}>{t("profile.loadingProfile")}</div>
      </div>
    );
  }

  const getInitials = () => {
    if (user.full_name && user.full_name.trim()) {
      const parts = user.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return user.full_name.slice(0, 2).toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const avatarUrl = (user as { avatar_url?: string }).avatar_url;

  return (
    <div className="w-full h-full p-4 md:p-6 overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className={`${themeClasses.text} text-2xl md:text-3xl font-bold`}>
          {t("profile.title")}
        </div>
        {!isEditing && (
          <Button
            variant="primary"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <IoMdColorFilter size={20} />
            <span>{t("profile.edit")}</span>
          </Button>
        )}
      </div>

      <div
        className={`${themeClasses.container} rounded-xl shadow-2xl p-6 max-w-2xl`}
      >
        <div className="flex flex-col items-center mb-8">
          <div
            className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${
              theme === "light" ? "bg-indigo-100" : "bg-indigo-900/40"
            } ring-4 ${
              theme === "light" ? "ring-indigo-200" : "ring-indigo-800"
            }`}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className={`text-2xl font-semibold ${
                  theme === "light" ? "text-indigo-600" : "text-indigo-300"
                }`}
              >
                {getInitials()}
              </span>
            )}
          </div>
          <p className={`mt-3 text-sm font-medium ${themeClasses.text}`}>
            {user.full_name || user.username}
          </p>
          <p className={`text-xs ${themeClasses.textSecondary}`}>
            {getRoleLabel(user.role)}
          </p>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                {t("profile.userId")}
              </label>
              <div
                className={`${themeClasses.text} ${
                  theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
                } px-4 py-2 rounded-lg`}
              >
                {user._id}
              </div>
            </div>

            <div>
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                {t("profile.username")}
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
                {t("profile.role")}
              </label>
              <div className={themeClasses.text}>
                <span
                  className={`px-3 py-1 rounded-full text-sm inline-block ${
                    user.role === UserRole.SUPER_ADMIN
                      ? theme === "light"
                        ? "bg-indigo-500/20 text-indigo-600"
                        : "bg-indigo-500/20 text-indigo-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>

            <div>
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                {t("profile.fullName")}
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formik.values.full_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="full_name"
                  placeholder={t("profile.placeholderName")}
                  error={formik.touched.full_name ? formik.errors.full_name : undefined}
                />
              ) : (
                <div
                  className={`${themeClasses.text} ${
                    theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
                  } px-4 py-2 rounded-lg`}
                >
                  {user.full_name || "—"}
                </div>
              )}
            </div>

            <div>
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                {t("profile.email")}
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="email"
                  placeholder={t("profile.placeholderEmail")}
                  error={formik.touched.email ? formik.errors.email : undefined}
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
                {t("profile.createdAt")}
              </label>
              <div
                className={`${themeClasses.text} ${
                  theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
                } px-4 py-2 rounded-lg`}
              >
                {formatDate(user.created_at)}
              </div>
            </div>

            <div>
              <label
                className={`block text-sm mb-2 ${themeClasses.textSecondary}`}
              >
                {t("profile.lastLogin")}
              </label>
              <div
                className={`${themeClasses.text} ${
                  theme === "light" ? "bg-gray-100" : "bg-gray-700/50"
                } px-4 py-2 rounded-lg`}
              >
                {formatDate((user as { lastLogin?: string }).lastLogin)}
              </div>
            </div>
          </div>

          {formik.errors.submit && (
            <div
              className={`mt-4 p-3 rounded ${
                theme === "light"
                  ? "bg-red-100 border border-red-400 text-red-700"
                  : "bg-red-900/30 border border-red-500 text-red-300"
              }`}
            >
              {(formik.errors as { submit?: string }).submit}
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
                disabled={formik.isSubmitting}
                className="flex items-center gap-2"
              >
                <IoMdClose size={20} />
                <span>{t("common.cancel")}</span>
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={formik.isSubmitting}
                className="flex items-center gap-2"
              >
                <IoMdCheckmark size={20} />
                <span>{formik.isSubmitting ? t("profile.saving") : t("profile.saveChanges")}</span>
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
