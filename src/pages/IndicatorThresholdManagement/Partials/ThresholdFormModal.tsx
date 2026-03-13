import { useTranslation } from "react-i18next";
import { Modal, Input, Button, Select } from "../../../components";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";
import { REFERENCE_THRESHOLDS_BY_CODE } from "../../../constants/indicatorThresholds";
import type { AdministrativeUnit } from "../../../services/administrativeUnitService";
import type { FloodIndicator } from "../../../services/indicatorValueService";

export interface ThresholdFormData {
  unit_id: string;
  indicator_id: string;
  x_min: number;
  x_max: number;
  unit: string;
}

interface ThresholdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditMode: boolean;
  form: ThresholdFormData;
  setForm: React.Dispatch<React.SetStateAction<ThresholdFormData>>;
  wards: AdministrativeUnit[];
  indicators: FloodIndicator[];
  errors?: Partial<Record<keyof ThresholdFormData, string>>;
  loading: boolean;
  titleAdd: string;
  titleEdit: string;
}

export default function ThresholdFormModal({
  isOpen,
  onClose,
  onSubmit,
  isEditMode,
  form,
  setForm,
  wards,
  indicators,
  errors,
  loading,
  titleAdd,
  titleEdit,
}: ThresholdFormModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const wardOptions = [
    { value: "", label: t("indicatorThreshold.placeholderWard") },
    ...wards.map((w) => ({ value: w._id, label: w.name })),
  ];
  const indicatorOptions = [
    { value: "", label: t("indicatorThreshold.placeholderIndicator") },
    ...indicators.map((i) => ({
      value: i._id,
      label: `${i.code} - ${i.name}`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? titleEdit : titleAdd}
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={loading}>
            {isEditMode ? t("common.update") : t("common.add")}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className={`text-sm ${themeClasses.textSecondary}`}>
          {t("indicatorThreshold.formHint")}
        </p>
        <Select
          label={t("indicatorThreshold.colUnit") + " *"}
          value={form.unit_id}
          options={wardOptions}
          error={errors?.unit_id}
          onChange={(e) =>
            setForm((p) => ({ ...p, unit_id: e.target.value }))
          }
          disabled={isEditMode}
          required
        />
        <Select
          label={t("indicatorThreshold.colIndicator") + " *"}
          value={form.indicator_id}
          options={indicatorOptions}
          error={errors?.indicator_id}
          onChange={(e) => {
            const id = e.target.value;
            const next = { ...form, indicator_id: id };
            if (!isEditMode && id) {
              const ind = indicators.find((i) => i._id === id);
              const ref = ind ? REFERENCE_THRESHOLDS_BY_CODE[ind.code] : null;
              if (ref) {
                next.x_min = ref.x_min;
                next.x_max = ref.x_max;
                next.unit = ref.unit;
              }
            }
            setForm(next);
          }}
          disabled={isEditMode}
          required
        />
        <Input
          label={t("indicatorThreshold.colUnitMeasure")}
          value={form.unit}
          onChange={(e) =>
            setForm((p) => ({ ...p, unit: e.target.value }))
          }
          placeholder="VD: m, mm, %"
          error={errors?.unit}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t("indicatorThreshold.labelXMin") + " *"}
            type="number"
            step="any"
            value={form.x_min === 0 ? "" : form.x_min}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                x_min: e.target.value === "" ? 0 : Number(e.target.value),
              }))
            }
            placeholder="0.8"
            error={errors?.x_min}
          />
          <Input
            label={t("indicatorThreshold.labelXMax") + " *"}
            type="number"
            step="any"
            value={form.x_max === 0 ? "" : form.x_max}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                x_max: e.target.value === "" ? 0 : Number(e.target.value),
              }))
            }
            placeholder="2.0"
            error={errors?.x_max}
          />
        </div>
      </div>
    </Modal>
  );
}
