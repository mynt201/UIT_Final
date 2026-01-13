import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components';
import { Button } from '../../components';
import { HOME_PATH, LOGIN_PATH } from '../../router/routePath';

const registerSchema = yup.object().shape({
  username: yup
    .string()
    .required('Tên người dùng là bắt buộc')
    .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/, 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'),
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
  confirmPassword: yup
    .string()
    .required('Xác nhận mật khẩu là bắt buộc')
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp'),
});

const Register = () => {
  const navigate = useNavigate();
  const { register: authRegister, isLoading } = useAuth();

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        setStatus(null);
        await authRegister({
          username: values.username,
          email: values.email,
          password: values.password
        });
        navigate(HOME_PATH);
      } catch (err) {
        if (err instanceof Error) {
          setStatus(err.message);
        } else {
          setStatus('Đã có lỗi xảy ra, vui lòng thử lại');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className='container px-4 mx-auto min-h-screen flex items-center justify-center '>
      <div className='max-w-lg w-full bg-white p-8 rounded-lg shadow-lg'>
        <div className='text-center mb-6'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-800'>Đăng ký</h2>
        </div>

        {formik.status && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
            {formik.status}
          </div>
        )}

        <form onSubmit={formik.handleSubmit}>
          <div className='mb-6'>
            <Input
              label='Tên người dùng'
              type='text'
              placeholder='Tên người dùng'
              name='username'
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username ? formik.errors.username : undefined}
            />
          </div>

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

          <div className='mb-6'>
            <Input
              label='Xác nhận mật khẩu'
              type='password'
              placeholder='**********'
              name='confirmPassword'
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword ? formik.errors.confirmPassword : undefined}
            />
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={isLoading || formik.isSubmitting}
          >
            {isLoading || formik.isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
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
