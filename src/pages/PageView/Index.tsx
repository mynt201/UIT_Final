import FloodMapView from './Partials/FloodMapView';
import logo from './../../assets/logo.jpg';
import { IoIosPerson } from 'react-icons/io';
import { IoIosMap } from 'react-icons/io';
import { IoIosListBox } from 'react-icons/io';
import { IoIosPrint } from 'react-icons/io';
import { IoIosPodium } from 'react-icons/io';
import { IoMdLogOut, IoMdPerson, IoMdSettings } from 'react-icons/io';
import FormSelect from '../../components/form/FormSelect';
import CheckboxGroup from '../../components/form/FormCheckbox';
import { options } from './constants';

const PageView = () => {
  return (
    <div className='w-full'>
      <header className='flex w-full  bg-black border-b-2 border-b-gray-700 h-20'>
        <div className='w-[20%] flex justify-center items-center gap-9'>
          <div className='text-white text-4xl'>Bản đồ </div>
          <img src={logo} className='w-12.5 h-12.5 rounded-2xl' />
        </div>
        <div className=' w-[50%] h-full flex items-center'>
          <div className='w-full flex bg-neutral-500 rounded-2xl'>
            <div className='w-12.5 flex justify-center items-center'>
              <IoIosMap color='white' size={25} />
            </div>
            <input
              placeholder='Tìm kiếm....'
              className='w-[calc(100%-20px)] bg-neutral-500 h-10 rounded-2xl outline-0 text-white'
            />
          </div>
        </div>

        <div className='w-[30%] h-full flex justify-center items-center'>
          <div className='flex gap-5'>
            <div className='flex items-end '>
              <IoIosPerson size={25} color='white' />
              <div className='text-white flex items-end'>Xin chào, My Nguyen</div>
            </div>
            <div className='flex items-end'>
              <IoMdLogOut color='white' size={25} />
              <div className='text-white '>Đăng xuất</div>
            </div>
          </div>
        </div>
      </header>
      <div className='w-full flex bg-black h-[calc(100vh-80px)]'>
        <div className='w-[20%] flex flex-col  border-r-2 border-r-gray-700 p-5'>
          <div className='flex-1'>
            <div className='text-white h-12.5 flex gap-2 hover:bg-neutral-500 rounded-2xl px-4 items-center'>
              <IoIosListBox color='white' size={25} /> <div>Đánh giá rủi ro ngập lụt</div>
            </div>
            <div className='text-white h-12.5 flex gap-2 hover:bg-neutral-500 rounded-2xl px-4 items-center'>
              <IoIosPodium color='white' size={25} />
              <div>Báo cáo rủi ro</div>
            </div>
            <div className='text-white h-12.5 flex gap-2 hover:bg-neutral-500 rounded-2xl px-4 items-center'>
              <IoIosPrint color='white' size={25} /> <div>Báo cáo xuất dữ liệu</div>
            </div>
          </div>
          <div className='border-t-2 border-t-gray-700 flex-1 py-4'>
            <div className='text-white h-12.5 flex gap-2 hover:bg-neutral-500 rounded-2xl px-4 items-center'>
              <IoMdPerson color='white' size={25} /> <div>Thông tin cá nhân</div>
            </div>
            <div className='text-white h-12.5 flex gap-2 hover:bg-neutral-500 rounded-2xl px-4 items-center'>
              <IoMdSettings color='white' size={25} /> <div>Cài đặt</div>
            </div>
          </div>
        </div>
        <div className='w-[80%]'>
          <div className='text-white text-3xl p-4'>Bản đồ khu vực TP.HCM. Dữ liệu bản đồ</div>
          <FloodMapView />

          <div className='flex bg-white p-4'>
            <div className='w-[80%] flex gap-10'>
              <div>
                <div className='text-black py-4'>Lọc theo khu vực</div>
                <div className='w-50'>
                  <FormSelect label='Chọn khu vực' onChange={() => {}} options={[]} value={''} />
                </div>
              </div>
              <div>
                <div className='text-black py-4'>Lọc theo mức độ</div>
                <div style={{ width: 300 }}>
                  <CheckboxGroup options={options} className='flex ' />
                </div>
              </div>
            </div>
            <div className='w-[20%] m-5 '>
              <div className='text-black mb-3'>Chú thích: Mức độ ngập lụt cao</div>
              <div className='bg-black p-4 '>
                <div className='flex gap-2 h-10'>
                  <div className='h-5 w-7.5 bg-red-500' />
                  <div className='text-white'>Cao</div>
                </div>
                <div className='flex gap-2 h-10'>
                  <div className='h-5 w-7.5 bg-orange-300' />
                  <div className='text-white'>Trung Bình</div>
                </div>
                <div className='flex gap-2 h-10'>
                  <div className='h-5 w-7.5 bg-green-300' />
                  <div className='text-white'>Thấp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageView;
