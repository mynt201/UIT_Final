import { Modal, Input, Select, Button } from '../../../components';
import { UserRole, ROLE_OPTIONS } from '../../../constants/roles';
import type { UserRoleType } from '../../../constants/roles';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: UserRoleType;
  fullName: string;
  ward_id: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  isEditMode: boolean;
  formik: {
    values: UserFormData;
    errors: Partial<Record<keyof UserFormData, string>>;
    touched: Partial<Record<keyof UserFormData, boolean>>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setFieldValue: (field: string, value: string) => void;
  };
  handleFormChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  loading: boolean;
  wardOptions?: { value: string; label: string }[];
  canSelectRole?: boolean;
  canSelectWard?: boolean;
}

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  isEditMode,
  formik,
  handleFormChange,
  wardOptions = [],
  canSelectRole = false,
  canSelectWard = false,
}: UserFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
      maxWidth='2xl'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='secondary' onClick={onClose}>
            Hủy
          </Button>
          <Button variant='primary' onClick={() => onSubmit()} type='submit'>
            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </div>
      }
    >
      <form onSubmit={onSubmit as React.FormEventHandler} className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <Input
            label='Tên người dùng *'
            type='text'
            required
            name='username'
            value={formik.values.username}
            onChange={handleFormChange || formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.username ? formik.errors.username : undefined}
          />
          <Input
            label='Email *'
            type='email'
            required
            name='email'
            value={formik.values.email}
            onChange={handleFormChange || formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email ? formik.errors.email : undefined}
          />
        </div>
        <Input
          label={isEditMode ? 'Mật khẩu (để trống nếu không đổi)' : 'Mật khẩu *'}
          type='password'
          required={!isEditMode}
          name='password'
          value={formik.values.password}
          onChange={handleFormChange || formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password ? formik.errors.password : undefined}
        />
        {(canSelectRole || isEditMode) && (
          <Select
            label='Vai trò *'
            required
            options={ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            value={formik.values.role}
            onChange={(e) => formik.setFieldValue('role', e.target.value)}
            error={formik.touched.role ? formik.errors.role : undefined}
          />
        )}
        {!isEditMode && !canSelectRole && (
          <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
            <p className='text-sm text-blue-700'>
              <strong>Vai trò:</strong> Quản lý phường (người dùng mới thuộc phường của bạn)
            </p>
          </div>
        )}
        {canSelectWard && formik.values.role === UserRole.WARD_ADMIN && (
          <Select
            label='Phường'
            required={formik.values.role === UserRole.WARD_ADMIN}
            options={[{ value: '', label: '-- Chọn phường --' }, ...wardOptions]}
            value={formik.values.ward_id}
            onChange={(e) => formik.setFieldValue('ward_id', e.target.value)}
            error={formik.touched.ward_id ? formik.errors.ward_id : undefined}
          />
        )}
        <Input
          label='Họ tên'
          type='text'
          name='fullName'
          value={formik.values.fullName}
          onChange={handleFormChange || formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.fullName ? formik.errors.fullName : undefined}
        />
      </form>
    </Modal>
  );
}
