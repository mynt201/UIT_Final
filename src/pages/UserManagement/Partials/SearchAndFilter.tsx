import { FaSearch, FaFilter } from 'react-icons/fa';
import { Input, Select } from '../../../components';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

interface SearchAndFilterProps {
  searchTerm: string;
  roleFilter: 'all' | 'admin' | 'user';
  statusFilter: 'all' | 'active' | 'inactive';
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: 'all' | 'admin' | 'user') => void;
  onStatusFilterChange: (value: 'all' | 'active' | 'inactive') => void;
  disabled?: boolean;
  isSearching?: boolean; // Indicates if search is in progress (debounced)
}

export default function SearchAndFilter({
  searchTerm,
  roleFilter,
  statusFilter,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  disabled = false,
  isSearching = false,
}: SearchAndFilterProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className={` rounded-lg p-4`}>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='relative'>
          <FaSearch
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isSearching ? 'text-blue-500' : themeClasses.textSecondary
            } z-10 transition-colors`}
          />
          {isSearching && (
            <div className='absolute right-3 top-1/2 transform -translate-y-1/2 z-10'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
            </div>
          )}
          <Input
            type='text'
            placeholder='Tìm kiếm tên, email, họ tên...'
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={disabled}
            className={`pl-10 ${isSearching ? 'pr-10' : ''}`}
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
            disabled={disabled}
            className='pl-10'
          />
        </div>
        <div className='relative'>
          <FaFilter
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} z-10`}
          />
          <Select
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'active', label: 'Đang hoạt động' },
              { value: 'inactive', label: 'Không hoạt động' },
            ]}
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
            disabled={disabled}
            className='pl-10'
          />
        </div>
      </div>
    </div>
  );
}

