import FormInput from '../../components/form/FormInput';
import Button from '../../components/Button';
import { Link } from 'react-router-dom';
import { LOGIN_PATH } from '../../router/routePath';

const Register = () => {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='w-full max-w-lg'>
        <div className='flex flex-col justify-center'>
          <div className='text-center mb-6'>
            <h2 className='text-3xl md:text-4xl font-extrabold'>Đăng ký</h2>
          </div>

          <form>
            <div className='mb-6'>
              <label className='block mb-2 font-extrabold'>Họ và tên</label>
              <FormInput type='text' placeholder='Họ và tên' />
            </div>

            <div className='mb-6'>
              <label className='block mb-2 font-extrabold'>Email</label>
              <FormInput type='email' placeholder='Email' />
            </div>

            <div className='mb-6'>
              <label className='block mb-2 font-extrabold'>Mật khẩu</label>
              <FormInput type='Mật khẩu' placeholder='**********' />
            </div>

            <Button>Đăng ký</Button>

            <p className='text-center font-extrabold mt-4'>
              Bạn đã có tài khoản chưa?{' '}
              <Link className='text-red-500 hover:underline' to={LOGIN_PATH}>
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
