import { useAuth } from '../../../contexts/AuthContext';
import { Modal, Button } from '../../../components';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thông tin cá nhân"
      maxWidth="md"
      footer={
        <Button variant="primary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={`block text-sm mb-1 ${themeClasses.textSecondary}`}>ID</label>
          <div className={themeClasses.text}>{user.id}</div>
        </div>

        <div>
          <label className={`block text-sm mb-1 ${themeClasses.textSecondary}`}>Tên người dùng</label>
          <div className={themeClasses.text}>{user.username}</div>
        </div>

        <div>
          <label className={`block text-sm mb-1 ${themeClasses.textSecondary}`}>Email</label>
          <div className={themeClasses.text}>{user.email}</div>
        </div>

        <div>
          <label className={`block text-sm mb-1 ${themeClasses.textSecondary}`}>Vai trò</label>
          <div>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
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
      </div>
    </Modal>
  );
}
