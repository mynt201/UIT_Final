import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { getThemeClasses } from '../../../../utils/themeUtils';
import { Modal, Button, Table, Input } from '../../../../components';
import { getIndicatorLabel } from '../../../../utils/indicatorLabels';
import { calculateAHP, setMatrixCell, type AHPResult } from '../../../../utils/ahpUtils';
import { LEGACY_AHP_ORDER, DEFAULT_AHP_MATRIX_5 } from '../constants';
import type { FloodIndicator } from '../../../../services/indicatorValueService';

const ahpCellSchema = yup.number().min(0.11, 'Từ 0.11 đến 9').max(9, 'Từ 0.11 đến 9');

function validateAhpMatrix(
  values: { matrix: number[][] },
  cellErrorMsg: string
): Record<string, unknown> {
  const errors: Record<string, unknown> = {};
  const m = values.matrix;
  if (!m || !Array.isArray(m)) return errors;
  const matrixErrors: (string | undefined)[][] = [];
  let hasError = false;
  for (let i = 0; i < m.length; i++) {
    matrixErrors[i] = [];
    for (let j = 0; j < (m[i]?.length ?? 0); j++) {
      if (i < j) {
        try {
          ahpCellSchema.validateSync(m[i][j]);
        } catch {
          matrixErrors[i][j] = cellErrorMsg;
          hasError = true;
        }
      }
    }
  }
  if (hasError) errors.matrix = matrixErrors;
  return errors;
}

type AhpMatrixRow = {
  rowIndex: number;
  rowLabel: string;
  [key: string]: string | number | undefined;
};

interface AhpMatrixModalProps {
  isOpen: boolean;
  indicatorsInAHOrder: FloodIndicator[];
  matrix: number[][];
  result: AHPResult | null;
  saving: boolean;
  onClose: () => void;
  onMatrixChange: (matrix: number[][]) => void;
  onResultChange: (result: AHPResult | null) => void;
  onSave: (weights: Array<{ code: string; weight: number }>) => void;
}

export default function AhpMatrixModal({
  isOpen,
  indicatorsInAHOrder,
  matrix,
  result,
  saving,
  onClose,
  onMatrixChange,
  onResultChange,
  onSave,
}: AhpMatrixModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const themeClasses = getThemeClasses(theme);
  const [editingCell, setEditingCell] = useState<{ i: number; j: number; value: string } | null>(
    null
  );

  const formik = useFormik({
    initialValues: { matrix },
    enableReinitialize: true,
    validate: (values) => validateAhpMatrix(values, t('ahp.cellError')),
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: () => {},
  });

  /** 5 chỉ số đầu có đúng thứ tự H,T,P,POP,D không */
  const first5MatchLegacy =
    indicatorsInAHOrder.length >= 5 &&
    JSON.stringify(indicatorsInAHOrder.slice(0, 5).map((i) => i.code)) ===
      JSON.stringify(LEGACY_AHP_ORDER);

  useEffect(() => {
    if (!isOpen || !first5MatchLegacy) return;
    const n = indicatorsInAHOrder.length;
    if (n === 5) {
      onMatrixChange(DEFAULT_AHP_MATRIX_5.map((r) => [...r]));
    } else {
      const merged = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => {
          if (i < 5 && j < 5) return DEFAULT_AHP_MATRIX_5[i][j];
          return matrix[i]?.[j] ?? 1;
        })
      );
      onMatrixChange(merged);
    }
    onResultChange(null);
    formik.setErrors({});
    queueMicrotask(() => setEditingCell(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCellChange = (i: number, j: number, value: number) => {
    // setMatrixCell cập nhật [i][j] và [j][i] = 1/value (reciprocal)
    const nextMatrix = setMatrixCell(matrix, i, j, value);
    onMatrixChange(nextMatrix);
    formik.setFieldValue('matrix', nextMatrix);
    formik.setFieldTouched(`matrix[${i}][${j}]`, true, false);
    formik.validateField('matrix').then(() => {});
  };

  const handleCalculate = async () => {
    const errs = await formik.validateForm();
    if (Object.keys(errs).length > 0) {
      formik.setErrors(errs);
      return;
    }
    onResultChange(calculateAHP(matrix));
  };

  const handleUseDefault = () => {
    const n = indicatorsInAHOrder.length;
    if (n === 5) {
      onMatrixChange(DEFAULT_AHP_MATRIX_5.map((r) => [...r]));
    } else {
      const merged = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => {
          if (i < 5 && j < 5) return DEFAULT_AHP_MATRIX_5[i][j];
          return matrix[i]?.[j] ?? 1;
        })
      );
      onMatrixChange(merged);
    }
    onResultChange(null);
    formik.setErrors({});
    setEditingCell(null);
  };

  const handleSave = () => {
    if (!result) return;
    onSave(
      indicatorsInAHOrder.map((ind, i) => ({
        code: ind.code,
        weight: result.weights[i] ?? 0,
      }))
    );
  };

  const getCellError = (i: number, j: number): string | undefined => {
    const err = formik.errors?.matrix;
    if (Array.isArray(err) && Array.isArray(err[i]) && err[i][j]) return String(err[i][j]);
    if (typeof err === 'string') return err;
    return undefined;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('ahp.title')}
      maxWidth='7xl'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='secondary' onClick={onClose}>
            {t('ahp.close')}
          </Button>
          {result && (
            <Button variant='primary' onClick={handleSave} disabled={saving || !result.isValid}>
              {t('ahp.saveWeights')}
            </Button>
          )}
        </div>
      }
    >
      <div className='space-y-4'>
        <p className={`text-sm ${themeClasses.textSecondary}`}>{t('ahp.hint')}</p>
        {indicatorsInAHOrder.length === 0 ? (
          <p className={themeClasses.textSecondary}>{t('ahp.noIndicators')}</p>
        ) : (
          <>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className='overflow-x-auto -mx-1'>
                <Table<AhpMatrixRow>
                  columns={[
                    { header: '', accessor: 'rowLabel' },
                    ...indicatorsInAHOrder.map((ind, colIdx) => ({
                      header: getIndicatorLabel(ind),
                      accessor: `col_${colIdx}` as keyof AhpMatrixRow,
                      render: (_value: unknown, row: AhpMatrixRow) => {
                        const i = row.rowIndex as number;
                        const j = colIdx;
                        const val = matrix[i]?.[j] ?? 1;
                        if (i === j)
                          return (
                            <div className='text-center'>
                              <span className='text-gray-400'>1</span>
                            </div>
                          );
                        if (i < j) {
                          const isEditing = editingCell?.i === i && editingCell?.j === j;
                          const displayValue = isEditing
                            ? editingCell!.value
                            : String(val != null ? val : '');
                          const cellError = getCellError(i, j);
                          return (
                            <div className='flex flex-col items-center gap-0.5'>
                              <Input
                                min={0.11}
                                max={9}
                                value={displayValue}
                                onFocus={() =>
                                  setEditingCell({ i, j, value: String(val != null ? val : '') })
                                }
                                onChange={(e) => setEditingCell({ i, j, value: e.target.value })}
                                onBlur={(e) => {
                                  const v = parseFloat(e.target.value);
                                  const clamped = !isNaN(v)
                                    ? Math.max(0.11, Math.min(9, v))
                                    : val ?? 1;
                                  handleCellChange(i, j, clamped);
                                  setEditingCell(null);
                                }}
                                className='w-14 px-1 py-0.5 text-center'
                                error={cellError}
                              />
                            </div>
                          );
                        }
                        return (
                          <div className='text-center'>
                            <span className='text-gray-500 text-xs'>{val?.toFixed(2) ?? '-'}</span>
                          </div>
                        );
                      },
                    })),
                  ]}
                  data={indicatorsInAHOrder.map((ind, i) => ({
                    rowIndex: i,
                    rowLabel: getIndicatorLabel(ind),
                    ...Object.fromEntries(
                      indicatorsInAHOrder.map((_, j) => [`col_${j}`, matrix[i]?.[j] ?? 1])
                    ),
                  }))}
                  emptyMessage=''
                />
              </div>
            </form>
            {result && (
              <div
                className={`mt-3 px-4 py-3 rounded-lg border ${themeClasses.border} ${themeClasses.backgroundTertiary}`}
              >
                <div className={`text-sm font-medium ${themeClasses.textSecondary}`}>
                  CR (Consistency Ratio)
                </div>
                <div
                  className={`mt-1 text-base font-semibold ${
                    result.isValid ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  CR = {result.consistencyRatio}{' '}
                  {result.isValid ? t('ahp.valid') : t('ahp.invalid')}
                </div>
                <div className={`mt-2 text-sm ${themeClasses.text}`}>
                  {t('ahp.weights')}:{' '}
                  {indicatorsInAHOrder
                    .map(
                      (ind, i) => `${getIndicatorLabel(ind)}=${(result.weights[i] ?? 0).toFixed(3)}`
                    )
                    .join(', ')}
                </div>
              </div>
            )}
            <div className='flex flex-wrap items-center gap-4 mt-4'>
              {first5MatchLegacy && (
                <Button variant='secondary' onClick={handleUseDefault}>
                  {t('ahp.useDefault')}
                </Button>
              )}
              <Button variant='primary' disabled={result?.isValid} onClick={handleCalculate}>
                {t('ahp.calculateWeights')}
              </Button>
              {formik.errors.matrix && typeof formik.errors.matrix === 'string' && (
                <span className='text-sm text-red-500'>{formik.errors.matrix}</span>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
