import { Modal, Button } from '../../../../components';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../../utils/themeUtils';
import type { AdministrativeUnit } from '../../../../services/administrativeUnitService';

interface WardDeleteModalProps {
  ward: AdministrativeUnit | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function WardDeleteModal({
  ward,
  loading,
  onClose,
  onConfirm,
}: WardDeleteModalProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <Modal
      isOpen={!!ward}
      onClose={onClose}
      title='Xác nhận xóa'
      maxWidth='sm'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='secondary' onClick={onClose}>
            Hủy
          </Button>
          <Button variant='danger' onClick={onConfirm} disabled={loading}>
            Xóa
          </Button>
        </div>
      }
    >
      <p className={themeClasses.text}>
        Xóa phường <strong>{ward?.name}</strong>? Hành động không thể hoàn tác.
      </p>
    </Modal>
  );
}
