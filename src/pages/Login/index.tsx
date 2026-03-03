import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components';
import { Button } from '../../components';
import { REGISTER_PATH, HOME_PATH, ADMIN_PATH } from '../../router/routePath';
import { UserRole } from '../../constants/roles';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login: authLogin, isLoading } = useAuth();

  const loginSchema = useMemo(
    () =>
      yup.object().shape({
        email: yup
          .string()
          .required(t('login.emailRequired'))
          .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            t('login.emailInvalid')
          ),
        password: yup
          .string()
          .required(t('login.passwordRequired'))
          .min(6, t('login.passwordMin')),
      }),
    [t]
  );

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const authData = await authLogin(values);
        if (authData.role === UserRole.SUPER_ADMIN || authData.role === UserRole.WARD_ADMIN) {
          navigate(ADMIN_PATH);
        } else {
          navigate(HOME_PATH);
        }
      } catch (err: unknown) {
        const ax = err as { response?: { data?: { error?: string } }; message?: string };
        const errorMessage = ax.response?.data?.error || ax.message || t('login.loginError');
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
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-800'>{t('login.title')}</h2>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className='mb-6'>
            <Input
              label={t('login.email')}
              type='email'
              placeholder={t('login.email')}
              name='email'
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email ? formik.errors.email : undefined}
            />
          </div>

          <div className='mb-6'>
            <Input
              label={t('login.password')}
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
            {isLoading || formik.isSubmitting ? t('login.loggingIn') : t('login.submit')}
          </Button>

          <p className='text-center font-extrabold mt-4 text-gray-600'>
            {t('login.noAccount')}{' '}
            <Link className='text-red-500 hover:underline' to={REGISTER_PATH}>
              {t('login.register')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
