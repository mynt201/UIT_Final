import { useState, useMemo, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../Login/authService";
import type { User } from "../../types";
import { getThemeClasses } from "../../utils/themeUtils";
import { useTheme } from "../../contexts/ThemeContext";
import { Table, Button } from "../../components";
import UserFormModal from "./Partials/UserFormModal";
import SearchAndFilter from "./Partials/SearchAndFilter";

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
    fullName: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const allUsers = getAllUsers();
      setUsers(allUsers);
    } catch {
      setError("Không thể tải danh sách người dùng");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.fullName &&
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setIsEditMode(true);
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: "",
        role: user.role,
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    } else {
      setIsEditMode(false);
      setEditingUser(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "user",
        fullName: "",
        phone: "",
        address: "",
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "user",
      fullName: "",
      phone: "",
      address: "",
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode && editingUser) {
        const updateData: {
          username: string;
          email: string;
          role: "admin" | "user";
          fullName?: string;
          phone?: string;
          address?: string;
          password?: string;
        } = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          fullName: formData.fullName || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateUser(editingUser.id, updateData);
      } else {
        if (!formData.password) {
          setError("Mật khẩu là bắt buộc khi tạo người dùng mới");
          setLoading(false);
          return;
        }
        await createUser(formData);
      }
      loadUsers();
      handleCloseModal();
    } catch (err) {
      setError((err as Error).message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteUser(userId);
      loadUsers();
    } catch (err) {
      setError((err as Error).message || "Không thể xóa người dùng");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div
      className={`p-4 md:p-6 space-y-4 md:space-y-6 ${themeClasses.background}`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${themeClasses.text}`}>
          Quản lý Người dùng
        </h1>
        <p className={themeClasses.textSecondary}>
          Quản lý tài khoản người dùng trong hệ thống
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Filters and Actions */}
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <SearchAndFilter
              searchTerm={searchTerm}
              roleFilter={roleFilter}
              onSearchChange={setSearchTerm}
              onRoleFilterChange={setRoleFilter}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="success"
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2"
            >
              <FaPlus />
              <span>Thêm người dùng</span>
            </Button>
          </div>
        </div>
        {(searchTerm || roleFilter !== "all") && (
          <div className={`text-sm ${themeClasses.textSecondary}`}>
            Hiển thị {filteredUsers.length} / {users.length} người dùng
          </div>
        )}
      </div>

      {/* Users Table */}
      <Table
        columns={[
          { header: "Tên người dùng", accessor: "username" },
          { header: "Email", accessor: "email" },
          {
            header: "Họ tên",
            accessor: "fullName",
            render: (value) => String(value || "-"),
          },
          {
            header: "Vai trò",
            accessor: "role",
            render: (value) => (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  value === "admin"
                    ? theme === "light"
                      ? "bg-indigo-500/20 text-indigo-600"
                      : "bg-indigo-500/20 text-indigo-400"
                    : `${
                        theme === "light"
                          ? "bg-gray-300/50 text-gray-600"
                          : "bg-gray-500/20 text-gray-400"
                      }`
                }`}
              >
                {value === "admin" ? "Quản trị viên" : "Người dùng"}
              </span>
            ),
          },
          {
            header: "Số điện thoại",
            accessor: "phone",
            render: (value) => String(value || "-"),
          },
          {
            header: "Ngày tạo",
            accessor: "createdAt",
            render: (value) => (
              <span className="text-sm">
                {formatDate(value as string | undefined)}
              </span>
            ),
          },
          {
            header: "Đăng nhập cuối",
            accessor: "lastLogin",
            render: (value) => (
              <span className="text-sm">
                {formatDate(value as string | undefined)}
              </span>
            ),
          },
          {
            header: "Thao tác",
            accessor: "id",
            render: (_, row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(row)}
                  className={`p-2 rounded transition-colors ${
                    theme === "light"
                      ? "text-indigo-600 hover:bg-indigo-500/20"
                      : "text-indigo-400 hover:bg-indigo-500/20"
                  }`}
                  title="Chỉnh sửa"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  title="Xóa"
                >
                  <FaTrash />
                </button>
              </div>
            ),
          },
        ]}
        data={filteredUsers}
        emptyMessage="Không tìm thấy người dùng nào"
      />

      {/* Add/Edit Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
        formData={formData}
        onFormDataChange={(field, value) =>
          setFormData({ ...formData, [field]: value })
        }
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default UserManagementPage;
