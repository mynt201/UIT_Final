import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components';
import { Button } from '../../components';
import { REGISTER_PATH, HOME_PATH, ADMIN_PATH } from '../../router/routePath';

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email là bắt buộc')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Email không đúng định dạng (ví dụ: user@example.com)'
    ),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin, isLoading } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const authData = await authLogin(values);
        if (authData.role === 'admin') {
          navigate(ADMIN_PATH);
        } else {
          navigate(HOME_PATH);
        }
      } catch (err) {
        const errorMessage = (err as Error).message || 'Sai email hoặc mật khẩu';
        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className='container px-4 mx-auto min-h-screen flex items-center justify-center '>
      <div className='max-w-lg w-full bg-white p-8 rounded-lg shadow-lg'>
        <div className='text-center mb-6'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-800'>Đăng nhập</h2>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className='mb-6'>
            <Input
              label='Email'
              type='email'
              placeholder='Email'
              name='email'
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email ? formik.errors.email : undefined}
            />
          </div>

          <div className='mb-6'>
            <Input
              label='Mật khẩu'
              type='password'
              placeholder='**********'
              name='password'
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password ? formik.errors.password : undefined}
            />
          </div>

          <Button type='submit' className='w-full' disabled={isLoading || formik.isSubmitting}>
            {isLoading || formik.isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
