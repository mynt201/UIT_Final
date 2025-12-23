import FormInput from '../../components/form/FormInput';
import Button from '../../components/Button';
import { Link } from 'react-router-dom';
import { LOGIN_PATH } from '../../router/routePath';

const Register = () => {
  return (
    <div className='w-full max-w-lg mx-auto min-h-screen '>
      <div className='w flex flex-col items-center'>
        <div className='text-center mb-6'>
          <h2 className='text-3xl md:text-4xl font-extrabold'>Sign up</h2>
        </div>
        <form action=''>
          <div className='mb-6'>
            <label className='block mb-2 font-extrabold' htmlFor=''>
              Full Name
            </label>
            <FormInput type='Name' placeholder='Name' />
          </div>
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
            <div className='w-full lg:w-auto px-4'>
              <a className='inline-block font-extrabold hover:underline' href='#'>
                Forgot your password?
              </a>
            </div>
          </div>
          <Button>Sign in</Button>
          <p className='text-center font-extrabold'>
            Don&rsquo;t have an account?{' '}
            <Link className='text-red-500 hover:underline' to={LOGIN_PATH}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
