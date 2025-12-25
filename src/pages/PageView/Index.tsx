import FloodMapView from './Partials/FloodMapView';
import logo from './../../assets/logo.jpg';
import { SiMapbox } from 'react-icons/si';

const PageView = () => {
  return (
    <div className='w-full'>
      <header className='flex w-full  bg-gray-900 border-b-2 border-b-gray-700 py-2 h-full'>
        <div className='w-[20%] flex justify-center items-center'>
          <div className='text-white'>Map</div>
          <img src={logo} className='w-12.5 h-12.5 rounded-2xl' />
        </div>
        <div className=' w-[50%] h-full flex items-center'>
          <div className='w-full h-full'>
            <SiMapbox color='white' size={20} />
            <input placeholder='Tìm kiếm....' className='w-[calc(100%-20px)] bg-neutral-500' />
          </div>
        </div>
        <div>User name</div>
      </header>
      <FloodMapView />
    </div>
  );
};

export default PageView;
