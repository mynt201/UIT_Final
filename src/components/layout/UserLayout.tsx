import { Outlet } from 'react-router-dom';

const UserLayout = () => {
  return (
    <main className='min-h-screen'>
      <Outlet />
    </main>
  );
};

export default UserLayout;
