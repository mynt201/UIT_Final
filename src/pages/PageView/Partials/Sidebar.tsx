import { IoIosListBox, IoIosPrint, IoIosPodium } from 'react-icons/io';
import { IoMdPerson, IoMdSettings } from 'react-icons/io';

export default function Sidebar() {
  return (
    <div className='w-[20%] flex flex-col border-r-2 border-r-gray-700 p-5'>
      <div className='flex-1'>
        <div className='text-white h-12.5 flex gap-2 hover:bg-neutral-500 rounded-2xl px-4 items-center'>
          <IoIosListBox color='white' size={25} />
          <div>Đánh giá rủi ro ngập lụt</div>
        </div>
        <div className='text-white h-12.5 flex gap-2 hover:bg-neutral-500 rounded-2xl px-4 items-center'>
          <IoIosPodium color='white' size={25} />
          <div>Báo cáo rủi ro</div>
        </div>
        <div className='text-white h-12.5 flex gap-2 hover:bg-neutral-500 rounded-2xl px-4 items-center'>
          <IoIosPrint color='white' size={25} />
          <div>Báo cáo xuất dữ liệu</div>
        </div>
      </div>
      <div className='border-t-2 border-t-gray-700 flex-1 py-4'>
        <div className='text-white h-12.5 flex gap-2 hover:bg-neutral-500 rounded-2xl px-4 items-center'>
          <IoMdPerson color='white' size={25} />
          <div>Thông tin cá nhân</div>
        </div>
        <div className='text-white h-12.5 flex gap-2 hover:bg-neutral-500 rounded-2xl px-4 items-center'>
          <IoMdSettings color='white' size={25} />
          <div>Cài đặt</div>
        </div>
      </div>
    </div>
  );
}
