import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { register } from '../Login/authService';
import FormInput from '../../components/form/FormInput';
import Button from '../../components/Button';
import { LOGIN_PATH } from '../../router/routePath';

const registerSchema = yup.object().shape({
  username: yup
    .string()
    .required('Tên người dùng là bắt buộc')
    .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/, 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'),
  email: yup.string().required('Email là bắt buộc').email('Email không hợp lệ'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: yup
    .string()
    .required('Xác nhận mật khẩu là bắt buộc')
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp'),
});

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    try {
      await registerSchema.validate(
        { username, email, password, confirmPassword },
        { abortEarly: false }
      );

      await register({ username, email, password });
      navigate('/');
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: FormErrors = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path as keyof FormErrors] = error.message;
          }
        });
        setErrors(validationErrors);
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Đã có lỗi xảy ra, vui lòng thử lại');
      }
    }
  };

  const handleFieldChange = (
    field: 'username' | 'email' | 'password' | 'confirmPassword',
    value: string
  ) => {
    switch (field) {
      case 'username':
        setUsername(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className='container px-4 mx-auto min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-lg w-full bg-white p-8 rounded-lg shadow-lg'>
        <div className='text-center mb-6'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-800'>Đăng ký</h2>
        </div>

        {submitError && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='mb-6'>
            <label className='block mb-2 font-extrabold text-gray-700'>Tên người dùng</label>
            <FormInput
              type='text'
              placeholder='Tên người dùng'
              value={username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              className={errors.username ? 'border-red-500! border-2' : ''}
            />
            {errors.username && <p className='mt-1 text-sm text-red-600'>{errors.username}</p>}
          </div>

          <div className='mb-6'>
            <label className='block mb-2 font-extrabold text-gray-700'>Email</label>
            <FormInput
              type='email'
              placeholder='Email'
              value={email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={errors.email ? 'border-red-500! border-2' : ''}
            />
            {errors.email && <p className='mt-1 text-sm text-red-600'>{errors.email}</p>}
          </div>

          <div className='mb-6'>
            <label className='block mb-2 font-extrabold text-gray-700'>Mật khẩu</label>
            <FormInput
              type='password'
              placeholder='**********'
              value={password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              className={errors.password ? 'border-red-500! border-2' : ''}
            />
            {errors.password && <p className='mt-1 text-sm text-red-600'>{errors.password}</p>}
          </div>

          <div className='mb-6'>
            <label className='block mb-2 font-extrabold text-gray-700'>Xác nhận mật khẩu</label>
            <FormInput
              type='password'
              placeholder='**********'
              value={confirmPassword}
              onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
              className={errors.confirmPassword ? 'border-red-500! border-2' : ''}
            />
            {errors.confirmPassword && (
              <p className='mt-1 text-sm text-red-600'>{errors.confirmPassword}</p>
            )}
          </div>

          <Button type='submit' className='w-full'>
            Đăng ký
          </Button>

          <p className='text-center font-extrabold mt-4 text-gray-600'>
            Bạn đã có tài khoản?{' '}
            <Link className='text-red-500 hover:underline' to={LOGIN_PATH}>
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
