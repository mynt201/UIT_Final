import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <Modal
      isOpen={!!ward}
      onClose={onClose}
      title={t('wardModal.confirmDelete')}
      maxWidth='sm'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='secondary' onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant='danger' onClick={onConfirm} disabled={loading}>
            {t('common.delete')}
          </Button>
        </div>
      }
    >
      <p className={themeClasses.text}>
        {t('wardModal.deleteWardConfirmPrefix')} <strong>{ward?.name}</strong>{' '}
        {t('wardModal.deleteWardConfirmSuffix')}
      </p>
    </Modal>
  );
}
