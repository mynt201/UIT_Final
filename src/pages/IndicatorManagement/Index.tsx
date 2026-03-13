import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { FaPlus, FaEdit, FaTrash, FaChartLine, FaSync } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { Modal, Button, Table, Pagination } from "../../components";
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
import type { AHPResult } from "../../utils/ahpUtils";
import { createEmptyAHPMatrix } from "../../utils/ahpUtils";
import { getIndicatorLabel } from "../../utils/indicatorLabels";
import AhpMatrixModal from "../DataManagement/WardManagement/Partials/AhpMatrixModal";
import {
  LEGACY_AHP_ORDER,
  DEFAULT_AHP_MATRIX_5,
} from "../DataManagement/WardManagement/constants";

function getIndicatorsInAHOrder(
  indicators: FloodIndicator[],
): FloodIndicator[] {
  const codeToInd = Object.fromEntries(indicators.map((i) => [i.code, i]));
  const ordered: FloodIndicator[] = [];
  for (const code of LEGACY_AHP_ORDER) {
    if (codeToInd[code]) ordered.push(codeToInd[code]);
  }
  for (const ind of indicators) {
    if (!LEGACY_AHP_ORDER.includes(ind.code)) ordered.push(ind);
  }
  return ordered;
}

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
  group_type: yup.string().required("Nhóm là bắt buộc"),
  unit: yup.string().max(50, "Đơn vị không được vượt quá 50 ký tự").nullable(),
  direction: yup
    .number()
    .oneOf([0, 1], "Hướng phải là 0 hoặc 1")
    .required("Hướng là bắt buộc"),
});

export default function IndicatorManagementPage() {
  const { t } = useTranslation();
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
  const [indicatorPagination, setIndicatorPagination] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["flood-indicators"],
    queryFn: () => floodIndicatorService.getIndicators(),
  });
  const indicators: FloodIndicator[] = data?.data ?? [];
  const indicatorsInAHOrder = getIndicatorsInAHOrder(indicators);
  const totalIndicators = indicators.length;
  const indicatorTotalPages = Math.max(
    1,
    Math.ceil(totalIndicators / indicatorPagination.limit),
  );
  const pagedIndicators = indicators.slice(
    (indicatorPagination.page - 1) * indicatorPagination.limit,
    indicatorPagination.page * indicatorPagination.limit,
  );

  const indicatorColumns: Array<{
    header: string;
    accessor: keyof FloodIndicator | "_id";
    render?: (value: unknown, row: FloodIndicator) => React.ReactNode;
  }> = [
    {
      header: t("indicatorManagement.colCode"),
      accessor: "code" as const,
      render: (v: unknown) => <span className="font-medium">{String(v)}</span>,
    },
    {
      header: t("indicatorManagement.colName"),
      accessor: "name" as const,
      render: (_: unknown, row: FloodIndicator) => getIndicatorLabel(row),
    },
    {
      header: t("indicatorManagement.colGroup"),
      accessor: "group_type" as const,
    },
    {
      header: t("indicatorManagement.colWeight"),
      accessor: "weight" as const,
      render: (v: unknown) => (
        <span className="block text-center">
          {typeof v === "number" ? v.toFixed(3) : "-"}
        </span>
      ),
    },
    {
      header: t("indicatorManagement.colUnit"),
      accessor: "unit" as const,
      render: (v: unknown) => (
        <span className="block text-center">{String(v ?? "-")}</span>
      ),
    },
    {
      header: t("indicatorManagement.colDirection"),
      accessor: "direction" as const,
      render: (_: unknown, row: FloodIndicator) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            row.direction === 0
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          }`}
        >
          {row.direction === 0
            ? t("indicatorManagement.directionInverse")
            : t("indicatorManagement.directionDirect")}
        </span>
      ),
    },
    ...(isSuperAdmin
      ? [
          {
            header: t("indicatorManagement.colActions"),
            accessor: "_id" as const,
            render: (_: unknown, row: FloodIndicator) => (
              <div className="flex gap-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEdit(row);
                  }}
                  className="p-1.5 rounded text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                  title={t("common.edit")}
                >
                  <FaEdit size={14} />
                </Button>
                <Button
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndicatorToDelete(row);
                  }}
                  className="p-1.5 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                  title={t("common.delete")}
                >
                  <FaTrash size={14} />
                </Button>
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
      toast.success(t("indicatorManagement.toastAddSuccess"));
      handleCloseModal();
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || t("indicatorManagement.toastAddError"),
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
      toast.success(t("indicatorManagement.toastUpdateSuccess"));
      handleCloseModal();
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || t("indicatorManagement.toastUpdateError"),
      );
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => floodIndicatorService.deleteIndicator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flood-indicators"] });
      // Xóa cache các trang dùng trọng số AHP để khi mở lại gọi API mới (đánh giá rủi ro, bản đồ, báo cáo)
      queryClient.removeQueries({ queryKey: ["risk-assessments"] });
      queryClient.removeQueries({ queryKey: ["map-wards"] });
      queryClient.removeQueries({ queryKey: ["report-dashboard"] });
      queryClient.removeQueries({ queryKey: ["report-compare"] });
      queryClient.removeQueries({ queryKey: ["indicator-values"] });
      queryClient.removeQueries({ queryKey: ["indicator-values-years"] });
      toast.success(t("indicatorManagement.toastDeleteSuccess"));
      setIndicatorToDelete(null);
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || t("indicatorManagement.toastDeleteError"),
      );
    },
  });

  const updateWeightsMut = useMutation({
    mutationFn: (items: Array<{ code: string; weight: number }>) =>
      floodIndicatorService.updateWeights(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flood-indicators"] });
      toast.success(t("ahp.toastWeightsSuccess"));
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
            {t("indicatorManagement.title")}
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
                      JSON.stringify(codes) === JSON.stringify(LEGACY_AHP_ORDER)
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
                  title={t("ahp.tooltip")}
                >
                  <FaChartLine size={14} />
                  {t("ahp.buttonLabel")}
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
                >
                  <FaPlus size={14} />
                  {t("common.add")}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-5">
          <p className={`text-sm ${themeClasses.textSecondary} mb-4`}>
            {t("ahp.directionHint")}
          </p>

          <Table<FloodIndicator>
            columns={indicatorColumns}
            data={pagedIndicators}
            emptyMessage={
              isSuperAdmin
                ? t("indicatorManagement.noIndicatorsAdd")
                : t("indicatorManagement.noIndicatorsShort")
            }
          />
          <Pagination
            page={indicatorPagination.page}
            totalPages={indicatorTotalPages}
            totalItems={totalIndicators}
            pageSize={indicatorPagination.limit}
            onPageChange={(page) =>
              setIndicatorPagination((prev) => ({ ...prev, page }))
            }
            label={t("userManagement.paginationShow", {
              from:
                (indicatorPagination.page - 1) * indicatorPagination.limit + 1,
              to: Math.min(
                indicatorPagination.page * indicatorPagination.limit,
                totalIndicators,
              ),
              total: totalIndicators,
            })}
            itemLabel={t("userManagement.paginationItems")}
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

      <AhpMatrixModal
        isOpen={ahpModalOpen}
        indicatorsInAHOrder={indicatorsInAHOrder}
        matrix={ahpMatrix}
        result={ahpResult}
        saving={updateWeightsMut.isPending}
        onClose={() => setAhpModalOpen(false)}
        onMatrixChange={setAhpMatrix}
        onResultChange={setAhpResult}
        onSave={(items) => updateWeightsMut.mutate(items)}
      />

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
