import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from './authService';
import FormInput from '../../components/form/FormInput';
import Button from '../../components/Button';
import { REGISTER_PATH } from '../../router/routePath';

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(username, password);

      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Sai tài khoản hoặc mật khẩu');
    }
  };

  return (
    <div className='container px-4 mx-auto min-h-screen flex items-center'>
      <div className='max-w-lg mx-auto '>
        <div className='text-center mb-6'>
          <h2 className='text-3xl md:text-4xl font-extrabold'>Sign in</h2>
        </div>
        <form action=''>
          <div className='mb-6'>
            <label className='block mb-2 font-extrabold' htmlFor=''>
              Email
            </label>
            <FormInput type='Email' placeholder='Email' />
          </div>
          <div className='mb-6'>
            <label className='block mb-2 font-extrabold' htmlFor=''>
              Password
            </label>
            <FormInput type='password' placeholder='**********' />
          </div>
          <div className='flex flex-wrap -mx-4 mb-6 items-center justify-between'>
            <div className='w-full lg:w-auto px-4 mb-4 lg:mb-0'>
              <label htmlFor=''>
                <input type='checkbox' />
                <span className='ml-1 font-extrabold'>Remember me</span>
              </label>
            </div>
            <div className='w-full lg:w-auto px-4'>
              <Link className='inline-block font-extrabold hover:underline' to={REGISTER_PATH}>
                Forgot your password?
              </Link>
            </div>
          </div>
          <Button>Sign in</Button>
          <p className='text-center font-extrabold'>
            Don&rsquo;t have an account?{' '}
            <Link className='text-red-500 hover:underline' to={REGISTER_PATH}>
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
