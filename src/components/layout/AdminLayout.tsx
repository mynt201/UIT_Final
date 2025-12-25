import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className='flex min-h-screen'>
      <aside className='w-64 bg-gray-800 text-white'>Admin Sidebar</aside>
      <main className='flex-1 p-6'>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
