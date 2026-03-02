import { FaSearch, FaFilter } from 'react-icons/fa';
import { Input, Select } from '../../../components';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';
import { ROLE_OPTIONS } from '../../../constants/roles';
import type { RoleFilterType } from '../../../constants/roles';

interface SearchAndFilterProps {
  searchTerm: string;
  roleFilter: RoleFilterType;
  wardFilter: string;
  statusFilter: 'all' | 'active' | 'inactive';
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: RoleFilterType) => void;
  onWardFilterChange?: (value: string) => void;
  onStatusFilterChange: (value: 'all' | 'active' | 'inactive') => void;
  disabled?: boolean;
  isSearching?: boolean;
  showWardFilter?: boolean;
  wardOptions?: { value: string; label: string }[];
}

export default function SearchAndFilter({
  searchTerm,
  roleFilter,
  wardFilter,
  statusFilter,
  onSearchChange,
  onRoleFilterChange,
  onWardFilterChange,
  onStatusFilterChange,
  disabled = false,
  isSearching = false,
  showWardFilter = false,
  wardOptions = [],
}: SearchAndFilterProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className='rounded-lg p-4'>
      <div className={`grid grid-cols-1 gap-4 ${showWardFilter ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
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
          <FaFilter className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} z-10`} />
          <Select
            options={[
              { value: 'all', label: 'Tất cả vai trò' },
              ...ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
            ]}
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value as RoleFilterType)}
            disabled={disabled}
            className='pl-10'
          />
        </div>
        {showWardFilter && onWardFilterChange && (
          <div className='relative'>
            <FaFilter className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} z-10`} />
            <Select
              options={[{ value: 'all', label: 'Tất cả phường' }, ...wardOptions]}
              value={wardFilter}
              onChange={(e) => onWardFilterChange(e.target.value)}
              disabled={disabled}
              className='pl-10'
            />
          </div>
        )}
        <div className='relative'>
          <FaFilter className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} z-10`} />
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

