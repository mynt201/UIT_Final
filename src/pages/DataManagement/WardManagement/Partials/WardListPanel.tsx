import { FaMapMarkedAlt, FaEdit, FaTrash, FaPlus, FaSync } from 'react-icons/fa';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../../utils/themeUtils';
import { Button } from '../../../../components';
import { formatNumber } from '../../../../utils/formatUtils';
import type { AdministrativeUnit } from '../../../../services/administrativeUnitService';
interface WardListPanelProps {
  wards: AdministrativeUnit[];
  loading: boolean;
  selectedWardId: string | null;
  pagination: { page: number; limit: number };
  paginationData: { page: number; pages: number };
  isSuperAdmin: boolean;
  onSelectWard: (id: string | null) => void;
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (ward: AdministrativeUnit) => void;
  onDelete: (ward: AdministrativeUnit) => void;
  onPageChange: (page: number) => void;
}

export default function WardListPanel({
  wards,
  loading,
  selectedWardId,
  pagination,
  paginationData,
  isSuperAdmin,
  onSelectWard,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onPageChange,
}: WardListPanelProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div
      className={`rounded-2xl border ${themeClasses.border} ${themeClasses.backgroundSecondary} overflow-hidden`}
    >
      <div className='px-5 py-4 border-b flex items-center justify-between'>
        <h2 className={`font-semibold text-lg flex items-center gap-2 ${themeClasses.text}`}>
          <FaMapMarkedAlt size={20} className='text-indigo-500' />
          Danh sách Phường
        </h2>
        <div className='flex items-center gap-2'>
          <button
            onClick={onRefresh}
            disabled={loading}
            className='p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50'
            title='Làm mới'
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
          {isSuperAdmin && (
            <Button
              onClick={onAdd}
              className='flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium'
            >
              <FaPlus size={14} />
              Thêm
            </Button>
          )}
        </div>
      </div>
      <div className='p-4'>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
          {wards.map((w) => (
            <button
              key={w._id}
              onClick={() => onSelectWard(selectedWardId === w._id ? null : w._id)}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedWardId === w._id
                  ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : theme === 'light'
                  ? 'bg-white hover:bg-gray-50 border border-gray-200'
                  : 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700'
              }`}
            >
              <div className={`font-medium truncate ${themeClasses.text}`}>{w.name}</div>
              <div className={`text-xs mt-1 ${themeClasses.textSecondary}`}>
                {formatNumber(w.area_km2)} km²
              </div>
              {isSuperAdmin && (
                <div className='flex gap-1 mt-2'>
                  <Button
                    variant='primary'
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(w);
                    }}
                    className=' rounded text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400'
                  >
                    <FaEdit size={12} />
                  </Button>
                  <Button
                    variant='danger'
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(w);
                    }}
                    className=' rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
                  >
                    <FaTrash size={12} />
                  </Button>
                </div>
              )}
            </button>
          ))}
        </div>
        {wards.length === 0 && !loading && (
          <p className={`text-center py-8 ${themeClasses.textSecondary}`}>Chưa có phường</p>
        )}
        {paginationData.pages > 1 && (
          <div className='flex justify-center gap-2 mt-4'>
            <Button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className='px-3 py-1 rounded border text-sm disabled:opacity-50'
            >
              ‹
            </Button>
            <span className='px-3 py-1 text-sm'>
              {pagination.page} / {paginationData.pages}
            </span>
            <Button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= paginationData.pages || loading}
              className='px-3 py-1 rounded border text-sm disabled:opacity-50'
            >
              ›
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
