import { useTranslation } from 'react-i18next';
import { Modal, Button } from '../../../../components';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../../utils/themeUtils';
import type { WardYearIndicatorRow } from '../types';

interface WardIndicatorDeleteModalProps {
  row: WardYearIndicatorRow | null;
  indicatorCount: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function WardIndicatorDeleteModal({
  row,
  indicatorCount,
  loading,
  onClose,
  onConfirm,
}: WardIndicatorDeleteModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <Modal
      isOpen={!!row}
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
        {t('wardModal.deleteCount', { count: indicatorCount })}{' '}
        <strong>{row?.unit_name}</strong> {t('wardModal.deleteCountYear')}{' '}
        <strong>{row?.data_year}</strong>?
      </p>
    </Modal>
  );
}
