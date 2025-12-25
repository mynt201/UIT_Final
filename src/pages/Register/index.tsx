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
            <h2 className='text-3xl md:text-4xl font-extrabold'>Sign up</h2>
          </div>

          <form>
            <div className='mb-6'>
              <label className='block mb-2 font-extrabold'>Full Name</label>
              <FormInput type='text' placeholder='Name' />
            </div>

            <div className='mb-6'>
              <label className='block mb-2 font-extrabold'>Email</label>
              <FormInput type='email' placeholder='Email' />
            </div>

            <div className='mb-6'>
              <label className='block mb-2 font-extrabold'>Password</label>
              <FormInput type='password' placeholder='**********' />
            </div>

            <div className='flex justify-between mb-6'>
              <a className='font-extrabold hover:underline' href='#'>
                Forgot your password?
              </a>
            </div>

            <Button>Sign in</Button>

            <p className='text-center font-extrabold mt-4'>
              Don&rsquo;t have an account?{' '}
              <Link className='text-red-500 hover:underline' to={LOGIN_PATH}>
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
