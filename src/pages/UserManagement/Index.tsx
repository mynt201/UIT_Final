/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { authService } from '../../services/authService';
import type { User } from '../../types';
import { getThemeClasses } from '../../utils/themeUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { Table, Button } from '../../components';
import UserFormModal from './Partials/UserFormModal';
import SearchAndFilter from './Partials/SearchAndFilter';

/**
 * VALIDATION FEATURES:
 * - Real-time validation on change and blur
 * - Custom email regex validation
 * - Domain validation for emails
 * - Conditional password validation (required for create, optional for update)
 * - Username format validation (alphanumeric + underscore)
 * - Phone number format validation
 * - Character limits for all fields
 */

// Validation schema cho user form
const createUserSchema = yup.object().shape({
  username: yup
    .string()
    .required('Tên người dùng là bắt buộc')
    .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
    .max(50, 'Tên người dùng không được vượt quá 50 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/, 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Email không đúng định dạng (ví dụ: user@example.com)'
    )
    .max(100, 'Email không được vượt quá 100 ký tự')
    .test('valid-email-domain', 'Tên miền email không hợp lệ', (value) => {
      if (!value) return true;
      const domain = value.split('@')[1];
      // Kiểm tra một số domain phổ biến hoặc format cơ bản
      return Boolean(domain && domain.includes('.') && domain.length >= 4);
    }),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  // Role is not required for new users as they are always admins
  role: yup.string().optional(),
  fullName: yup.string().max(100, 'Họ tên không được vượt quá 100 ký tự').optional(),
  phone: yup
    .string()
    .matches(/^[\d\s\-+()]*$/, 'Số điện thoại không hợp lệ')
    .max(20, 'Số điện thoại không được vượt quá 20 ký tự')
    .optional()
    .test('phone-format', 'Số điện thoại phải có ít nhất 10 chữ số', (value) => {
      if (!value) return true;
      const digitsOnly = value.replace(/\D/g, '');
      return digitsOnly.length >= 10;
    }),
  address: yup.string().max(200, 'Địa chỉ không được vượt quá 200 ký tự').optional(),
});

const updateUserSchema = yup.object().shape({
  username: yup
    .string()
    .required('Tên người dùng là bắt buộc')
    .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
    .max(50, 'Tên người dùng không được vượt quá 50 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/, 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Email không đúng định dạng (ví dụ: user@example.com)'
    )
    .max(100, 'Email không được vượt quá 100 ký tự')
    .test('valid-email-domain', 'Tên miền email không hợp lệ', (value) => {
      if (!value) return true;
      const domain = value.split('@')[1];
      // Kiểm tra một số domain phổ biến hoặc format cơ bản
      return Boolean(domain && domain.includes('.') && domain.length >= 4);
    }),
  password: yup.string().optional().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: yup
    .string()
    .required('Vai trò là bắt buộc')
    .oneOf(['admin', 'user'], 'Vai trò không hợp lệ'),
  fullName: yup.string().max(100, 'Họ tên không được vượt quá 100 ký tự').optional(),
  phone: yup
    .string()
    .matches(/^[\d\s\-+()]*$/, 'Số điện thoại không hợp lệ')
    .max(20, 'Số điện thoại không được vượt quá 20 ký tự')
    .optional()
    .test('phone-format', 'Số điện thoại phải có ít nhất 10 chữ số', (value) => {
      if (!value) return true;
      const digitsOnly = value.replace(/\D/g, '');
      return digitsOnly.length >= 10;
    }),
  address: yup.string().max(200, 'Địa chỉ không được vượt quá 200 ký tự').optional(),
});

const UserManagementPage = () => {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null as number | null,
    prevPage: null as number | null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // Immediate search term for UI
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounced search term for API
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch users with React Query
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: [
      'users',
      pagination.page,
      pagination.limit,
      debouncedSearchTerm,
      roleFilter,
      statusFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: () => {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy,
        order: sortOrder,
      };

      if (debouncedSearchTerm && debouncedSearchTerm.trim())
        params.search = debouncedSearchTerm.trim();
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.isActive = statusFilter === 'active';

      return authService.getUsers(params);
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Extract data from query result
  const users: User[] = usersData?.users ?? [];
  const paginationData: any = usersData?.pagination;

  // Use pagination from query data, fallback to local state
  const displayPagination = paginationData || pagination;

  // Check if search is in progress (debounced)
  const isSearching = searchTerm !== debouncedSearchTerm;

  // Mutations for CRUD operations
  const createUserMutation = useMutation({
    mutationFn: (userData: {
      username: string;
      email: string;
      password: string;
      fullName?: string;
      phone?: string;
      address?: string;
    }) => authService.createAdminUser(userData),
    onSuccess: () => {
      toast.success('Thêm người dùng thành công!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseModal();
      userFormik.resetForm();
    },
    onError: (error: any) => {
      const apiError = error?.data?.error;
      const errorDetails = error?.data?.details;

      // Parse and set field-specific errors
      const fieldErrors: Record<string, string> = {};

      if (apiError) {
        if (apiError.includes('Email already registered')) {
          fieldErrors.email = 'Email này đã được đăng ký';
        } else if (apiError.includes('Username already taken')) {
          fieldErrors.username = 'Tên người dùng này đã tồn tại';
        } else if (apiError.includes('Username, email, and password are required')) {
          if (!userFormik.values.username) fieldErrors.username = 'Tên người dùng là bắt buộc';
          if (!userFormik.values.email) fieldErrors.email = 'Email là bắt buộc';
          if (!userFormik.values.password) fieldErrors.password = 'Mật khẩu là bắt buộc';
        } else if (apiError.includes('Validation failed') && Array.isArray(errorDetails)) {
          // Parse detailed validation errors
          errorDetails.forEach((detail: any) => {
            const field = detail.field;
            const message = detail.message;

            if (field === 'username') {
              fieldErrors.username = message.includes('between 3 and 50')
                ? 'Tên người dùng phải có 3-50 ký tự'
                : message.includes('letters, numbers, and underscores')
                ? 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'
                : 'Tên người dùng không hợp lệ';
            } else if (field === 'email') {
              fieldErrors.email = message.includes('valid email')
                ? 'Email không đúng định dạng'
                : 'Email không hợp lệ';
            } else if (field === 'password') {
              fieldErrors.password = message.includes('at least 6')
                ? 'Mật khẩu phải có ít nhất 6 ký tự'
                : 'Mật khẩu không hợp lệ';
            }
          });
        } else if (apiError.includes('User already exists')) {
          fieldErrors.email = 'Người dùng này đã tồn tại';
          fieldErrors.username = 'Người dùng này đã tồn tại';
        }
      }

      // Set field errors in Formik
      if (Object.keys(fieldErrors).length > 0) {
        userFormik.setErrors(fieldErrors);
      }

      // Show toast error
      const errorMessage = apiError || error?.message || 'Có lỗi xảy ra khi thêm người dùng';
      toast.error(errorMessage);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: Partial<User> }) =>
      authService.updateUser(id, userData),
    onSuccess: () => {
      toast.success('Cập nhật người dùng thành công!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseModal();
      userFormik.resetForm();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.data?.error || error?.message || 'Có lỗi xảy ra khi cập nhật người dùng';
      toast.error(errorMessage);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => authService.deleteUser(userId),
    onSuccess: () => {
      toast.success('Xóa người dùng thành công!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.error || error?.message || 'Không thể xóa người dùng';
      toast.error(errorMessage);
    },
  }); // Separate loading for API calls

  // Custom handleChange to clear API errors when user starts typing
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Clear API errors when user starts typing
    const currentErrors = userFormik.errors;
    const apiErrorFields = ['username', 'email', 'password']; // Fields that can have API errors

    if (
      apiErrorFields.includes(e.target.name) &&
      currentErrors[e.target.name as keyof typeof currentErrors]
    ) {
      // Clear the specific field error if it exists
      const newErrors = { ...currentErrors };
      delete newErrors[e.target.name as keyof typeof currentErrors];
      userFormik.setErrors(newErrors);
    }

    // Call original handleChange
    userFormik.handleChange(e);
  };

  // Formik cho user form
  const userFormik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      role: 'user' as 'admin' | 'user',
      fullName: '',
      phone: '',
      address: '',
    },
    validationSchema: isEditMode ? updateUserSchema : createUserSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      // Clear any existing API errors before submitting
      userFormik.setErrors({});

      if (isEditMode && editingUser) {
        // Update user
        const updateData: Record<string, unknown> = {
          username: values.username,
          email: values.email,
          role: values.role,
          fullName: values.fullName || undefined,
          phone: values.phone || undefined,
          address: values.address || undefined,
        };
        if (values.password) {
          updateData.password = values.password;
        }
        updateUserMutation.mutate({ id: editingUser._id as string, userData: updateData });
      } else {
        // Create new admin user (all new users are admins)
        createUserMutation.mutate({
          username: values.username,
          email: values.email,
          password: values.password,
          fullName: values.fullName || undefined,
          phone: values.phone || undefined,
          address: values.address || undefined,
        });
      }
    },
  });

  const filteredUsers = useMemo(() => {
    // Since we're using server-side filtering, filteredUsers is just users
    return users;
  }, [users]);

  const handleOpenModal = (user?: User) => {
    if (user && user._id) {
      setIsEditMode(true);
      setEditingUser(user);
      userFormik.setValues({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    } else {
      setIsEditMode(false);
      setEditingUser(null);
      // All new users are admins by default
      userFormik.resetForm({
        values: {
          username: '',
          email: '',
          password: '',
          role: 'admin',
          fullName: '',
          phone: '',
          address: '',
        },
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingUser(null);
    userFormik.resetForm();
  };

  // Debounced search function - chờ 500ms sau lần nhập cuối cùng
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setDebouncedSearchTerm(term);
        setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
      }, 500),
    []
  );

  const handleSearch = (term: string) => {
    // Update local state immediately for UI feedback
    setSearchTerm(term);
    // Debounce the actual search/filter operation
    debouncedSearch(term);
  };

  const handleRoleFilter = (role: 'all' | 'admin' | 'user') => {
    setRoleFilter(role);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleStatusFilter = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSort = (newSortBy: string) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    deleteUserMutation.mutate(userId);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className={`p-4 md:p-6 space-y-4 md:space-y-6 ${themeClasses.background}`}>
      {/* Header */}
      <div className='mb-6'>
        <h1 className={`text-3xl font-bold mb-2 ${themeClasses.text}`}>Quản lý Người dùng</h1>
        <p className={themeClasses.textSecondary}>Quản lý tài khoản người dùng trong hệ thống</p>
      </div>

      {/* Filters and Actions */}
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
      >
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <div className='md:col-span-2'>
            <SearchAndFilter
              searchTerm={searchTerm}
              roleFilter={roleFilter}
              statusFilter={statusFilter}
              onSearchChange={handleSearch}
              onRoleFilterChange={handleRoleFilter}
              onStatusFilterChange={handleStatusFilter}
              disabled={loadingUsers}
              isSearching={isSearching}
            />
          </div>
          <div className='flex justify-end h-fit my-5'>
            <Button
              variant='success'
              onClick={() => handleOpenModal({ role: 'admin' } as User)}
              className='flex items-center gap-2'
            >
              <FaPlus />
              <span>Thêm người dùng</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className='relative'>
        {loadingUsers && (
          <div className='absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg'>
            <div className='flex items-center gap-3'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
              <span className='text-sm text-gray-600'>Đang tải...</span>
            </div>
          </div>
        )}
        <Table
          columns={[
            {
              header: 'Tên người dùng',
              accessor: 'username',
              render: (value) => (
                <button
                  onClick={() => handleSort('username')}
                  className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${themeClasses.text}`}
                >
                  {String(value)}
                  {sortBy === 'username' && (
                    <span className='text-xs'>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              ),
            },
            {
              header: 'Email',
              accessor: 'email',
              render: (value) => String(value),
            },
            {
              header: 'Họ tên',
              accessor: 'fullName',
              render: (value) => (
                <button
                  onClick={() => handleSort('name')}
                  className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${themeClasses.text}`}
                >
                  {String(value || '-')}
                  {sortBy === 'name' && (
                    <span className='text-xs'>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              ),
            },
            {
              header: 'Vai trò',
              accessor: 'role',
              render: (value) => (
                <button
                  onClick={() => handleSort('role')}
                  className={`flex items-center gap-1 hover:text-blue-500 transition-colors`}
                >
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      value === 'admin'
                        ? theme === 'light'
                          ? 'bg-indigo-500/20 text-indigo-600'
                          : 'bg-indigo-500/20 text-indigo-400'
                        : `${
                            theme === 'light'
                              ? 'bg-gray-300/50 text-gray-600'
                              : 'bg-gray-500/20 text-gray-400'
                          }`
                    }`}
                  >
                    {value === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                  </span>
                  {sortBy === 'role' && (
                    <span className='text-xs ml-1'>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              ),
            },
            {
              header: 'Số điện thoại',
              accessor: 'phone',
              render: (value) => String(value || '-'),
            },
            {
              header: 'Ngày tạo',
              accessor: 'createdAt',
              render: (value) => (
                <button
                  onClick={() => handleSort('createdAt')}
                  className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${themeClasses.text}`}
                >
                  <span className='text-sm'>{formatDate(value as string | undefined)}</span>
                  {sortBy === 'createdAt' && (
                    <span className='text-xs'>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              ),
            },
            {
              header: 'Đăng nhập cuối',
              accessor: 'lastLogin',
              render: (value) => (
                <button
                  onClick={() => handleSort('lastLogin')}
                  className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${themeClasses.text}`}
                >
                  <span className='text-sm'>{formatDate(value as string | undefined)}</span>
                  {sortBy === 'lastLogin' && (
                    <span className='text-xs'>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              ),
            },
            {
              header: 'Thao tác',
              accessor: 'id',
              render: (_, row) => (
                <div className='flex gap-2'>
                  <button
                    onClick={() => handleOpenModal(row as User)}
                    className={`p-2 rounded transition-colors ${
                      theme === 'light'
                        ? 'text-indigo-600 hover:bg-indigo-500/20'
                        : 'text-indigo-400 hover:bg-indigo-500/20'
                    }`}
                    title='Chỉnh sửa'
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete((row as User)._id || '')}
                    className='p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors'
                    title='Xóa'
                  >
                    <FaTrash />
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredUsers}
          emptyMessage='Không tìm thấy người dùng nào'
        />
      </div>

      {/* Pagination */}
      {displayPagination.total > 0 && (
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 mt-6'>
          <div className='text-sm text-gray-600'>
            Hiển thị {(displayPagination.page - 1) * displayPagination.limit + 1} -{' '}
            {Math.min(displayPagination.page * displayPagination.limit, displayPagination.total)}{' '}
            của {displayPagination.total} người dùng
          </div>

          <div className='flex items-center gap-2'>
            {/* Items per page selector */}
            <select
              value={displayPagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              disabled={loadingUsers}
              className='px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <option value={10}>10/trang</option>
              <option value={25}>25/trang</option>
              <option value={50}>50/trang</option>
              <option value={100}>100/trang</option>
            </select>

            {/* Page navigation */}
            <div className='flex gap-1'>
              <button
                onClick={() => handlePageChange(displayPagination.page - 1)}
                disabled={!displayPagination.hasPrevPage || loadingUsers}
                className='px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                ‹ Trước
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, displayPagination.pages) }, (_, i) => {
                let pageNum;
                if (displayPagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (displayPagination.page <= 3) {
                  pageNum = i + 1;
                } else if (displayPagination.page >= displayPagination.pages - 2) {
                  pageNum = displayPagination.pages - 4 + i;
                } else {
                  pageNum = displayPagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                      pageNum === displayPagination.page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    disabled={loadingUsers}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(displayPagination.page + 1)}
                disabled={!displayPagination.hasNextPage || loadingUsers}
                className='px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Sau ›
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={userFormik.handleSubmit as (e?: React.FormEvent<HTMLFormElement>) => void}
        isEditMode={isEditMode}
        formik={userFormik}
        handleFormChange={handleFormChange}
        loading={
          userFormik.isSubmitting || createUserMutation.isPending || updateUserMutation.isPending
        }
      />
    </div>
  );
};

export default UserManagementPage;
