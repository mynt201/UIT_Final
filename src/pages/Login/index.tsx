import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { login } from './authService';
import FormInput from '../../components/form/FormInput';
import Button from '../../components/Button';
import { REGISTER_PATH } from '../../router/routePath';

const loginSchema = yup.object().shape({
  username: yup.string().required('Email là bắt buộc').email('Email không hợp lệ'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

interface FormErrors {
  username?: string;
  password?: string;
}

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    try {
      await loginSchema.validate({ username, password }, { abortEarly: false });

      const result = await login({ username, password });

      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: FormErrors = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path as keyof FormErrors] = error.message;
          }
        });
        setErrors(validationErrors);
      } else {
        setSubmitError('Sai tài khoản hoặc mật khẩu');
      }
    }
  };

  const handleFieldChange = (field: 'username' | 'password', value: string) => {
    if (field === 'username') {
      setUsername(value);
    } else {
      setPassword(value);
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className='container px-4 mx-auto min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-lg w-full bg-white p-8 rounded-lg shadow-lg'>
        <div className='text-center mb-6'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-800'>Đăng nhập</h2>
        </div>

        {submitError && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='mb-6'>
            <label className='block mb-2 font-extrabold text-gray-700'>Email</label>
            <FormInput
              type='email'
              placeholder='Email'
              value={username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              className={errors.username ? 'border-red-500! border-2' : ''}
            />
            {errors.username && <p className='mt-1 text-sm text-red-600'>{errors.username}</p>}
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

          <Button type='submit' className='w-full'>
            Đăng nhập
          </Button>

          <p className='text-center font-extrabold mt-4 text-gray-600'>
            Bạn chưa có tài khoản?{' '}
            <Link className='text-red-500 hover:underline' to={REGISTER_PATH}>
              Đăng ký
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
