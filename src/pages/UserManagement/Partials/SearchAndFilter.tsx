import { FaSearch, FaFilter } from 'react-icons/fa';
import { Input, Select } from '../../../components';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

interface SearchAndFilterProps {
  searchTerm: string;
  roleFilter: 'all' | 'admin' | 'user';
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: 'all' | 'admin' | 'user') => void;
}

export default function SearchAndFilter({
  searchTerm,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
}: SearchAndFilterProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className={` rounded-lg p-4`}>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='relative'>
          <FaSearch
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} z-10`}
          />
          <Input
            type='text'
            placeholder='Tìm kiếm người dùng...'
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-10'
          />
        </div>
        <div className='relative'>
          <FaFilter
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} z-10`}
          />
          <Select
            options={[
              { value: 'all', label: 'Tất cả vai trò' },
              { value: 'admin', label: 'Quản trị viên' },
              { value: 'user', label: 'Người dùng' },
            ]}
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value as 'all' | 'admin' | 'user')}
            className='pl-10'
          />
        </div>
      </div>
    </div>
  );
}

