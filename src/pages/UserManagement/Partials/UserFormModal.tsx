import { type User } from "../../Login/authService";
import { Modal, Input, Select, Button } from "../../../components";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditMode: boolean;
  formData: {
    username: string;
    email: string;
    password: string;
    role: "admin" | "user";
    fullName: string;
    phone: string;
    address: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  loading: boolean;
  error?: string | null;
}

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  isEditMode,
  formData,
  onFormDataChange,
  loading,
  error,
}: UserFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      maxWidth="2xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={loading}>
            {loading ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tên người dùng *"
            type="text"
            required
            value={formData.username}
            onChange={(e) => onFormDataChange("username", e.target.value)}
          />
          <Input
            label="Email *"
            type="email"
            required
            value={formData.email}
            onChange={(e) => onFormDataChange("email", e.target.value)}
          />
        </div>
        <Input
          label={
            isEditMode
              ? "Mật khẩu (để trống nếu không đổi)"
              : "Mật khẩu *"
          }
          type="password"
          required={!isEditMode}
          value={formData.password}
          onChange={(e) => onFormDataChange("password", e.target.value)}
        />
        <Select
          label="Vai trò *"
          required
          options={[
            { value: "user", label: "Người dùng" },
            { value: "admin", label: "Quản trị viên" },
          ]}
          value={formData.role}
          onChange={(e) =>
            onFormDataChange("role", e.target.value as "admin" | "user")
          }
        />
        <Input
          label="Họ tên"
          type="text"
          value={formData.fullName}
          onChange={(e) => onFormDataChange("fullName", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Số điện thoại"
            type="tel"
            value={formData.phone}
            onChange={(e) => onFormDataChange("phone", e.target.value)}
          />
          <Input
            label="Địa chỉ"
            type="text"
            value={formData.address}
            onChange={(e) => onFormDataChange("address", e.target.value)}
            />
          </div>
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
        </form>
      </Modal>
    );
  }

