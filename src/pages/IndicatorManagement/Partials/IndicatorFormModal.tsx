import { Modal, Input, Button } from "../../../components";
import type { FloodIndicatorCreatePayload } from "../../../services/indicatorValueService";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

export interface IndicatorFormData {
  code: string;
  name: string;
  group_type: string;
  unit: string;
  direction: 0 | 1;
}

interface IndicatorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditMode: boolean;
  form: IndicatorFormData;
  setForm: React.Dispatch<React.SetStateAction<IndicatorFormData>>;
  errors?: Partial<Record<keyof IndicatorFormData, string>>;
  loading: boolean;
}

export default function IndicatorFormModal({
  isOpen,
  onClose,
  onSubmit,
  isEditMode,
  form,
  setForm,
  errors,
  loading,
}: IndicatorFormModalProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Chỉnh sửa chỉ số" : "Thêm chỉ số mới"}
      maxWidth="2xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={loading}>
            {isEditMode ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className={`text-xs ${themeClasses.textSecondary}`}>
          Hướng: 1 = Thuận (giá trị cao = rủi ro cao), 0 = Nghịch (giá trị cao =
          rủi ro thấp).
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Mã *"
            value={form.code}
            error={errors?.code}
            onChange={(e) =>
              setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
            }
            placeholder="Ví dụ: H (Địa hình)"
            disabled={isEditMode}
          />
          <Input
            label="Tên *"
            value={form.name}
            error={errors?.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Ví dụ: Địa hình (Height/Elevation)"
          />
        </div>
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}
          >
            Nhóm *
          </label>
          <select
            value={form.group_type}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                group_type: e.target
                  .value as FloodIndicatorCreatePayload["group_type"],
              }))
            }
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 ${themeClasses.input} ${themeClasses.border}`}
          >
            <option value="Hazard">Hazard</option>
            <option value="Exposure">Exposure</option>
            <option value="Susceptibility">Susceptibility</option>
            <option value="Resilience">Resilience</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Đơn vị"
            value={form.unit}
            error={errors?.unit}
            onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
            placeholder="Ví dụ: m, mm, người/km²..."
          />
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}
            >
              Hướng (1=Thuận, 0=Nghịch)
            </label>
            <select
              value={form.direction}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  direction: Number(e.target.value) as 0 | 1,
                }))
              }
              disabled={isEditMode}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 ${themeClasses.input} ${themeClasses.border} ${isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <option value={1}>Thuận</option>
              <option value={0}>Nghịch</option>
            </select>
            {isEditMode && (
              <p className={`text-xs mt-1 ${themeClasses.textSecondary}`}>
                Không được sửa khi chỉnh sửa — thay đổi sẽ ảnh hưởng đến chuẩn hóa dữ liệu.
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
