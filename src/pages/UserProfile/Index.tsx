import { useState, useEffect } from 'react';
import { IoMdColorFilter, IoMdCheckmark, IoMdClose } from 'react-icons/io';
import {
  getCurrentUser,
  updateUserProfile,
  type User,
  type UpdateUserProfileData,
} from '../Login/authService';
import * as yup from 'yup';

const profileSchema = yup.object().shape({
  fullName: yup.string(),
  phone: yup.string().matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  address: yup.string(),
  email: yup.string().email('Email không hợp lệ'),
});

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserProfileData>({
    fullName: '',
    phone: '',
    address: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        email: currentUser.email || '',
      });
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        email: user.email || '',
      });
    }
    setErrors({});
    setSuccessMessage('');
  };

  const handleChange = (field: keyof UpdateUserProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    try {
      await profileSchema.validate(formData, { abortEarly: false });
      if (!user) return;

      setIsLoading(true);
      const updatedUser = await updateUserProfile(user.id, formData);
      setUser(updatedUser);
      setIsEditing(false);
      setSuccessMessage('Cập nhật thông tin thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
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

  if (!user) {
    return (
      <div className='w-[80%] p-6'>
        <div className='text-white text-3xl mb-6'>Thông tin cá nhân</div>
        <div className='text-white'>Đang tải thông tin...</div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className='w-[80%] p-6 h-full overflow-y-auto'>
      <div className='flex justify-between items-center mb-6'>
        <div className='text-white text-3xl font-bold'>Thông tin cá nhân</div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
          >
            <IoMdColorFilter size={20} />
            <span>Chỉnh sửa</span>
          </button>
        )}
      </div>

      {successMessage && (
        <div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded'>
          {successMessage}
        </div>
      )}

      <div className='bg-[#0a1628] rounded-xl shadow-2xl p-6 max-w-2xl'>
        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='md:col-span-2'>
              <label className='block text-gray-400 text-sm mb-2'>ID người dùng</label>
              <div className='text-white bg-gray-700/50 px-4 py-2 rounded-lg'>{user.id}</div>
            </div>

            <div>
              <label className='block text-gray-400 text-sm mb-2'>Tên người dùng</label>
              <div className='text-white bg-gray-700/50 px-4 py-2 rounded-lg'>{user.username}</div>
            </div>

            <div>
              <label className='block text-gray-400 text-sm mb-2'>Vai trò</label>
              <div className='text-white'>
                <span
                  className={`px-3 py-1 rounded-full text-sm inline-block ${
                    user.role === 'admin'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </span>
              </div>
            </div>

            <div>
              <label className='block text-gray-400 text-sm mb-2'>Họ và tên</label>
              {isEditing ? (
                <div>
                  <input
                    type='text'
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Nhập họ và tên'
                  />
                  {errors.fullName && (
                    <p className='mt-1 text-sm text-red-400'>{errors.fullName}</p>
                  )}
                </div>
              ) : (
                <div className='text-white bg-gray-700/50 px-4 py-2 rounded-lg'>
                  {user.fullName || 'Chưa cập nhật'}
                </div>
              )}
            </div>

            <div>
              <label className='block text-gray-400 text-sm mb-2'>Email</label>
              {isEditing ? (
                <div>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Nhập email'
                  />
                  {errors.email && <p className='mt-1 text-sm text-red-400'>{errors.email}</p>}
                </div>
              ) : (
                <div className='text-white bg-gray-700/50 px-4 py-2 rounded-lg'>{user.email}</div>
              )}
            </div>

            <div>
              <label className='block text-gray-400 text-sm mb-2'>Số điện thoại</label>
              {isEditing ? (
                <div>
                  <input
                    type='tel'
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Nhập số điện thoại'
                  />
                  {errors.phone && <p className='mt-1 text-sm text-red-400'>{errors.phone}</p>}
                </div>
              ) : (
                <div className='text-white bg-gray-700/50 px-4 py-2 rounded-lg'>
                  {user.phone || 'Chưa cập nhật'}
                </div>
              )}
            </div>

            <div>
              <label className='block text-gray-400 text-sm mb-2'>Địa chỉ</label>
              {isEditing ? (
                <div>
                  <input
                    type='text'
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Nhập địa chỉ'
                  />
                  {errors.address && <p className='mt-1 text-sm text-red-400'>{errors.address}</p>}
                </div>
              ) : (
                <div className='text-white bg-gray-700/50 px-4 py-2 rounded-lg'>
                  {user.address || 'Chưa cập nhật'}
                </div>
              )}
            </div>

            <div>
              <label className='block text-gray-400 text-sm mb-2'>Ngày tạo tài khoản</label>
              <div className='text-white bg-gray-700/50 px-4 py-2 rounded-lg'>
                {formatDate(user.createdAt)}
              </div>
            </div>

            <div>
              <label className='block text-gray-400 text-sm mb-2'>Lần đăng nhập cuối</label>
              <div className='text-white bg-gray-700/50 px-4 py-2 rounded-lg'>
                {formatDate(user.lastLogin)}
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className='mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
              {errors.submit}
            </div>
          )}

          {isEditing && (
            <div className='flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700'>
              <button
                type='button'
                onClick={handleCancel}
                className='flex items-center gap-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors'
                disabled={isLoading}
              >
                <IoMdClose size={20} />
                <span>Hủy</span>
              </button>
              <button
                type='submit'
                className='flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50'
                disabled={isLoading}
              >
                <IoMdCheckmark size={20} />
                <span>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
