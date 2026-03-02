import { useState, useMemo } from "react";
import * as yup from "yup";
import { FaPlus, FaEdit, FaTrash, FaChartLine, FaSync } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { Modal, Button, Table } from "../../components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  floodIndicatorService,
  type FloodIndicator,
  type FloodIndicatorCreatePayload,
} from "../../services/indicatorValueService";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../constants/roles";
import IndicatorFormModal, {
  type IndicatorFormData,
} from "./Partials/IndicatorFormModal";
import {
  calculateAHP,
  createEmptyAHPMatrix,
  setMatrixCell,
  type AHPResult,
} from "../../utils/ahpUtils";

/** Thứ tự cố định cho bảng AHP: C1 Địa hình, C2 Triều cường, C3 Lượng mưa, C4 Dân số, C5 Mật độ cống */
const AHP_ORDER = ["H", "T", "P", "POP", "D"];

import { getIndicatorLabel } from "../../utils/indicatorLabels";

/** Ma trận mặc định theo thứ tự H,T,P,POP,D (từ tài liệu) */
const DEFAULT_AHP_MATRIX_5: number[][] = [
  [1, 2, 3, 5, 4],
  [1 / 2, 1, 2, 4, 3],
  [1 / 3, 1 / 2, 1, 3, 2],
  [1 / 5, 1 / 4, 1 / 3, 1, 1 / 2],
  [1 / 4, 1 / 3, 1 / 2, 2, 1],
];

const defaultForm: IndicatorFormData = {
  code: "",
  name: "",
  group_type: "Hazard",
  unit: "",
  direction: 1,
};

const indicatorSchema = yup.object().shape({
  code: yup
    .string()
    .required("Mã chỉ số là bắt buộc")
    .trim()
    .max(20, "Mã chỉ số không được vượt quá 20 ký tự"),
  name: yup
    .string()
    .required("Tên chỉ số là bắt buộc")
    .trim()
    .max(200, "Tên chỉ số không được vượt quá 200 ký tự"),
  group_type: yup
    .string()
    .required("Nhóm là bắt buộc"),
  unit: yup
    .string()
    .max(50, "Đơn vị không được vượt quá 50 ký tự")
    .nullable(),
  direction: yup
    .number()
    .oneOf([0, 1], "Hướng phải là 0 hoặc 1")
    .required("Hướng là bắt buộc"),
});

export default function IndicatorManagementPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIndicator, setEditingIndicator] =
    useState<FloodIndicator | null>(null);
  const [indicatorToDelete, setIndicatorToDelete] =
    useState<FloodIndicator | null>(null);
  const [form, setForm] = useState<IndicatorFormData>(defaultForm);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof IndicatorFormData, string>>
  >({});
  const [ahpModalOpen, setAhpModalOpen] = useState(false);
  const [ahpMatrix, setAhpMatrix] = useState<number[][]>([]);
  const [ahpResult, setAhpResult] = useState<AHPResult | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["flood-indicators"],
    queryFn: () => floodIndicatorService.getIndicators(),
  });
  const indicators: FloodIndicator[] = data?.data ?? [];

  const indicatorsInAHOrder = useMemo(() => {
    const codeToInd = Object.fromEntries(indicators.map((i) => [i.code, i]));
    const ordered: FloodIndicator[] = [];
    for (const code of AHP_ORDER) {
      if (codeToInd[code]) ordered.push(codeToInd[code]);
    }
    for (const ind of indicators) {
      if (!AHP_ORDER.includes(ind.code)) ordered.push(ind);
    }
    return ordered;
  }, [indicators]);

  const indicatorColumns = [
    {
      header: "Ký hiệu",
      accessor: "code" as const,
      render: (v: unknown) => <span className="font-medium">{String(v)}</span>,
    },
    {
      header: "Tên chỉ số",
      accessor: "name" as const,
      render: (_: unknown, row: FloodIndicator) => getIndicatorLabel(row),
    },
    { header: "Nhóm", accessor: "group_type" as const },
    {
      header: "Trọng số",
      accessor: "weight" as const,
      render: (v: unknown) => (
        <span className="block text-center">
          {typeof v === "number" ? v.toFixed(3) : "-"}
        </span>
      ),
    },
    {
      header: "Đơn vị",
      accessor: "unit" as const,
      render: (v: unknown) => (
        <span className="block text-center">{String(v ?? "-")}</span>
      ),
    },
    {
      header: "Hướng",
      accessor: "direction" as const,
      render: (_: unknown, row: FloodIndicator) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            row.direction === 0
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          }`}
        >
          {row.direction === 0 ? "Nghịch" : "Thuận"}
        </span>
      ),
    },
    ...(isSuperAdmin
      ? [
          {
            header: "Thao tác",
            accessor: "_id" as const,
            render: (_: unknown, row: FloodIndicator) => (
              <div className="flex gap-1 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEdit(row);
                  }}
                  className="p-1.5 rounded text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                  title="Chỉnh sửa"
                >
                  <FaEdit size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndicatorToDelete(row);
                  }}
                  className="p-1.5 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                  title="Xóa"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const createMut = useMutation({
    mutationFn: (p: FloodIndicatorCreatePayload) =>
      floodIndicatorService.createIndicator(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flood-indicators"] });
      toast.success("Đã thêm chỉ số!");
      handleCloseModal();
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Lỗi khi thêm",
      );
    },
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<FloodIndicatorCreatePayload>;
    }) => floodIndicatorService.updateIndicator(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flood-indicators"] });
      toast.success("Đã cập nhật chỉ số!");
      handleCloseModal();
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Lỗi khi cập nhật",
      );
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => floodIndicatorService.deleteIndicator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flood-indicators"] });
      toast.success("Đã xóa chỉ số.");
      setIndicatorToDelete(null);
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Lỗi khi xóa",
      );
    },
  });

  const updateWeightsMut = useMutation({
    mutationFn: (items: Array<{ code: string; weight: number }>) =>
      floodIndicatorService.updateWeights(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flood-indicators"] });
      toast.success("Đã lưu trọng số AHP!");
      setAhpModalOpen(false);
    },
    onError: (e: unknown) => {
      const err = e as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      const msg =
        err?.response?.data?.error || err?.message || "Lỗi khi lưu trọng số";
      toast.error(msg);
    },
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingIndicator(null);
    setForm(defaultForm);
    setFormErrors({});
  };

  const handleOpenAdd = () => {
    setForm(defaultForm);
    setIsEditMode(false);
    setEditingIndicator(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ind: FloodIndicator) => {
    setForm({
      code: ind.code,
      name: ind.name,
      group_type: ind.group_type,
      unit: ind.unit ?? "",
      direction: (ind.direction ?? 1) as 0 | 1,
    });
    setIsEditMode(true);
    setEditingIndicator(ind);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      await indicatorSchema.validate(form, { abortEarly: false });
      setFormErrors({});
    } catch (err) {
      const e: Record<string, string> = {};
      (err as yup.ValidationError).inner?.forEach((x) => {
        if (x.path) {
          e[x.path as keyof IndicatorFormData] = x.message;
        }
      });
      setFormErrors(e);
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc.");
      return;
    }
    if (isEditMode && editingIndicator) {
      updateMut.mutate({
        id: editingIndicator._id,
        payload: {
          name: form.name,
          group_type: form.group_type,
          unit: form.unit,
          direction: form.direction,
        },
      });
    } else {
      const weight = 1 / Math.max(1, indicators.length + 1);
      createMut.mutate({ ...form, weight });
    }
  };

  const loading = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-6 mx-auto">
      <div
        className={`rounded-2xl border ${themeClasses.border} ${themeClasses.backgroundSecondary} overflow-hidden`}
      >
        <div className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3">
          <h1
            className={`font-semibold text-xl flex items-center gap-2 ${themeClasses.text}`}
          >
            <FaChartLine size={22} className="text-amber-500" />
            Quản lý danh mục chỉ số
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 ${themeClasses.text}`}
              title="Làm mới"
            >
              <FaSync className={isLoading ? "animate-spin" : ""} />
            </button>
            {isSuperAdmin && (
              <>
                <button
                  onClick={() => {
                    const n = indicatorsInAHOrder.length;
                    const codes = indicatorsInAHOrder.map((i) => i.code);
                    if (
                      n === 5 &&
                      JSON.stringify(codes) === JSON.stringify(AHP_ORDER)
                    ) {
                      setAhpMatrix(DEFAULT_AHP_MATRIX_5.map((r) => [...r]));
                    } else {
                      setAhpMatrix(n > 0 ? createEmptyAHPMatrix(n) : []);
                    }
                    setAhpResult(null);
                    setAhpModalOpen(true);
                  }}
                  disabled={indicatorsInAHOrder.length < 2}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-medium"
                  title="Tính trọng số từ ma trận so sánh cặp (AHP)"
                >
                  <FaChartLine size={14} />
                  Tính trọng số AHP
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
                >
                  <FaPlus size={14} />
                  Thêm
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-5">
          <p className={`text-sm ${themeClasses.textSecondary} mb-4`}>
            Hướng: 1 = Thuận, 0 = Nghịch. Trọng số được tính bằng AHP (ma trận
            so sánh cặp), không nhập tay.
          </p>

          <Table<FloodIndicator>
            columns={indicatorColumns}
            data={indicators}
            emptyMessage={
              isSuperAdmin
                ? "Chưa có chỉ số. Nhấn Thêm để thêm mới."
                : "Chưa có chỉ số."
            }
          />
        </div>
      </div>

      <IndicatorFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
        form={form}
        setForm={setForm}
        errors={formErrors}
        loading={loading}
      />

      {/* AHP Modal - Tính trọng số từ ma trận so sánh cặp */}
      <Modal
        isOpen={ahpModalOpen}
        onClose={() => setAhpModalOpen(false)}
        title="Phân tích thứ bậc (AHP) - Tính trọng số"
        maxWidth="5xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAhpModalOpen(false)}>
              Đóng
            </Button>
            {ahpResult && (
              <Button
                variant="primary"
                onClick={() =>
                  updateWeightsMut.mutate(
                    indicatorsInAHOrder.map((ind, i) => ({
                      code: ind.code,
                      weight: ahpResult.weights[i] ?? 0,
                    })),
                  )
                }
                disabled={updateWeightsMut.isPending || !ahpResult.isValid}
              >
                Lưu trọng số
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            1 = bằng nhau, 2–4–6 = trị trung gian, 3 = quan trọng hơn, 5 = rất
            quan trọng, 7–9 = cực kỳ. Chỉ nhập tam giác trên (ô [i] so với [j],
            i &lt; j).
            {indicatorsInAHOrder.length === 5 &&
              JSON.stringify(indicatorsInAHOrder.map((i) => i.code)) ===
                JSON.stringify(AHP_ORDER) && (
                <span>
                  {" "}
                  Nhấn &quot;Dùng mặc định&quot; để load ma trận mẫu (Địa hình,
                  Triều cường, Lượng mưa, Dân số, Mật độ cống).
                </span>
              )}
          </p>
          {indicatorsInAHOrder.length < 2 ? (
            <p className={themeClasses.textSecondary}>
              Cần ít nhất 2 chỉ số để tính AHP.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border"></th>
                      {indicatorsInAHOrder.map((ind) => (
                        <th
                          key={ind._id}
                          className={`p-2 border text-center font-medium ${themeClasses.border}`}
                          title={getIndicatorLabel(ind)}
                        >
                          {getIndicatorLabel(ind)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {indicatorsInAHOrder.map((ind, i) => (
                      <tr key={ind._id}>
                        <td
                          className={`p-2 border font-medium ${themeClasses.border}`}
                        >
                          {getIndicatorLabel(ind)}
                        </td>
                        {indicatorsInAHOrder.map((_, j) => (
                          <td
                            key={j}
                            className={`p-1 border text-center ${themeClasses.border}`}
                          >
                            {i === j ? (
                              <span className="text-gray-400">1</span>
                            ) : i < j ? (
                              <input
                                type="number"
                                min="0.11"
                                max="9"
                                step="0.5"
                                value={ahpMatrix[i]?.[j] ?? 1}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  if (!isNaN(v))
                                    setAhpMatrix(
                                      setMatrixCell(ahpMatrix, i, j, v),
                                    );
                                }}
                                className={`w-14 px-1 py-0.5 text-center rounded border text-sm ${
                                  theme === "light"
                                    ? "bg-white border-gray-300"
                                    : "bg-gray-800 border-gray-600"
                                }`}
                              />
                            ) : (
                              <span className="text-gray-500 text-xs">
                                {ahpMatrix[i]?.[j]?.toFixed(2) ?? "-"}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {indicatorsInAHOrder.length === 5 &&
                  JSON.stringify(indicatorsInAHOrder.map((i) => i.code)) ===
                    JSON.stringify(AHP_ORDER) && (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setAhpMatrix(DEFAULT_AHP_MATRIX_5.map((r) => [...r]))
                      }
                    >
                      Dùng mặc định
                    </Button>
                  )}
                <Button
                  variant="primary"
                  onClick={() => setAhpResult(calculateAHP(ahpMatrix))}
                >
                  Tính trọng số
                </Button>
                {ahpResult && (
                  <div className={`text-sm ${themeClasses.text}`}>
                    <span
                      className={
                        ahpResult.isValid
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }
                    >
                      CR = {ahpResult.consistencyRatio}{" "}
                      {ahpResult.isValid ? "✓ Hợp lệ" : "⚠ Cần đánh giá lại"}
                    </span>
                    {" · "}
                    Trọng số:{" "}
                    {indicatorsInAHOrder
                      .map(
                        (ind, i) =>
                          `${getIndicatorLabel(ind)}=${(ahpResult.weights[i] ?? 0).toFixed(3)}`,
                      )
                      .join("; ")}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={!!indicatorToDelete}
        onClose={() => setIndicatorToDelete(null)}
        title="Xác nhận xóa"
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIndicatorToDelete(null)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                indicatorToDelete && deleteMut.mutate(indicatorToDelete._id)
              }
              disabled={deleteMut.isPending}
            >
              Xóa
            </Button>
          </div>
        }
      >
        <p className={themeClasses.text}>
          Xóa chỉ số{" "}
          <strong>
            {indicatorToDelete && getIndicatorLabel(indicatorToDelete)}
          </strong>
          ? Các giá trị indicator_values liên quan có thể bị ảnh hưởng.
        </p>
      </Modal>
    </div>
  );
}
