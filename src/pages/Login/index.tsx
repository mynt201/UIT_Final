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
    <div className='container px-4 mx-auto min-h-screen flex items-center justify-center'>
      <div className='max-w-lg w-full'>
        <div className='text-center mb-6'>
          <h2 className='text-3xl md:text-4xl font-extrabold'>Đăng nhập</h2>
        </div>

        <form>
          <div className='mb-6'>
            <label className='block mb-2 font-extrabold'>Email</label>
            <FormInput type='email' placeholder='Email' />
          </div>

          <div className='mb-6'>
            <label className='block mb-2 font-extrabold'>Mật khẩu</label>
            <FormInput type='password' placeholder='**********' />
          </div>

          <Button>Đăng nhập</Button>

          <p className='text-center font-extrabold mt-4'>
            Bạn đã có tài khoản chưa?{' '}
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
