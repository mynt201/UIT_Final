import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { FaPlus, FaEdit, FaTrash, FaSlidersH, FaSync, FaCopy } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { Modal, Button, Table, Select, Pagination } from "../../components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  floodIndicatorService,
  type FloodIndicator,
} from "../../services/indicatorValueService";
import {
  administrativeUnitService,
  type AdministrativeUnit,
} from "../../services/administrativeUnitService";
import {
  indicatorThresholdService,
  type IndicatorThreshold,
  type IndicatorThresholdCreatePayload,
} from "../../services/indicatorThresholdService";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../constants/roles";
import { formatNumber } from "../../utils/formatUtils";
import ThresholdFormModal, {
  type ThresholdFormData,
} from "./Partials/ThresholdFormModal";

const defaultForm: ThresholdFormData = {
  unit_id: "",
  indicator_id: "",
  x_min: 0.8,
  x_max: 2.0,
  unit: "",
};

const thresholdSchema = yup.object().shape({
  unit_id: yup.string().required("Vui lòng chọn phường"),
  indicator_id: yup.string().required("Vui lòng chọn chỉ số"),
  x_min: yup.number().required("X_min là bắt buộc"),
  x_max: yup
    .number()
    .required("X_max là bắt buộc")
    .min(yup.ref("x_min"), "X_max phải lớn hơn X_min"),
  unit: yup.string().max(50, "Đơn vị đo không quá 50 ký tự").default(""),
});

function unitName(unit: IndicatorThreshold["unit_id"]): string {
  return typeof unit === "object" && unit?.name ? unit.name : "—";
}
function indicatorDisplay(ind: IndicatorThreshold["indicator_id"]): string {
  return typeof ind === "object" && ind?.code != null
    ? `${ind.code} — ${ind.name ?? ""}`
    : "—";
}

export default function IndicatorThresholdManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

  const [filterUnitId, setFilterUnitId] = useState<string>("");
  const [filterIndicatorId, setFilterIndicatorId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingThreshold, setEditingThreshold] =
    useState<IndicatorThreshold | null>(null);
  const [thresholdToDelete, setThresholdToDelete] =
    useState<IndicatorThreshold | null>(null);
  const [form, setForm] = useState<ThresholdFormData>(defaultForm);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ThresholdFormData, string>>
  >({});
  const [thresholdPagination, setThresholdPagination] = useState({
    page: 1,
    limit: 10,
  });

  const {
    data: thresholdsRes,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "indicator-thresholds",
      filterUnitId || undefined,
      filterIndicatorId || undefined,
    ],
    queryFn: () =>
      indicatorThresholdService.getList({
        ...(filterUnitId ? { unit_id: filterUnitId } : {}),
        ...(filterIndicatorId ? { indicator_id: filterIndicatorId } : {}),
      }),
  });
  const { data: wardsRes } = useQuery({
    queryKey: ["administrative-units-all"],
    queryFn: () => administrativeUnitService.getAllUnits(),
  });
  const { data: indicatorsRes } = useQuery({
    queryKey: ["flood-indicators"],
    queryFn: () => floodIndicatorService.getIndicators(),
  });

  const thresholds: IndicatorThreshold[] = thresholdsRes?.data ?? [];
  const wards: AdministrativeUnit[] = wardsRes?.data ?? [];
  const indicators: FloodIndicator[] = indicatorsRes?.data ?? [];

  const handleOpenEdit = useCallback((row: IndicatorThreshold) => {
    const unitId =
      typeof row.unit_id === "object" ? row.unit_id._id : String(row.unit_id);
    const indicatorId =
      typeof row.indicator_id === "object"
        ? row.indicator_id._id
        : String(row.indicator_id);
    setForm({
      unit_id: unitId,
      indicator_id: indicatorId,
      x_min: row.x_min,
      x_max: row.x_max,
      unit: row.unit ?? "",
    });
    setIsEditMode(true);
    setEditingThreshold(row);
    setIsModalOpen(true);
  }, []);

  const handleOpenCopy = useCallback((row: IndicatorThreshold) => {
    const indicatorId =
      typeof row.indicator_id === "object"
        ? row.indicator_id._id
        : String(row.indicator_id);
    setForm({
      unit_id: "",
      indicator_id: indicatorId,
      x_min: row.x_min,
      x_max: row.x_max,
      unit: row.unit ?? "",
    });
    setIsEditMode(false);
    setEditingThreshold(null);
    setIsModalOpen(true);
  }, []);

  const columns = useMemo(
    () => [
      {
        header: t("indicatorThreshold.colUnit"),
        accessor: "unit_id" as const,
        render: (_: unknown, row: IndicatorThreshold) => (
          <span className="font-medium">{unitName(row.unit_id)}</span>
        ),
      },
      {
        header: t("indicatorThreshold.colIndicator"),
        accessor: "indicator_id" as const,
        render: (_: unknown, row: IndicatorThreshold) =>
          indicatorDisplay(row.indicator_id),
      },
      {
        header: t("indicatorThreshold.colUnitMeasure"),
        accessor: "unit" as const,
        render: (v: unknown) => (
          <span>{v != null && String(v).trim() !== "" ? String(v) : "—"}</span>
        ),
      },
      {
        header: t("indicatorThreshold.labelXMin"),
        accessor: "x_min" as const,
        render: (v: unknown) => (
          <span className="tabular-nums">
            {typeof v === "number" ? formatNumber(v, 2) : "—"}
          </span>
        ),
      },
      {
        header: t("indicatorThreshold.labelXMax"),
        accessor: "x_max" as const,
        render: (v: unknown) => (
          <span className="tabular-nums">
            {typeof v === "number" ? formatNumber(v, 2) : "—"}
          </span>
        ),
      },
      ...(isSuperAdmin
        ? [
            {
              header: t("indicatorThreshold.colActions"),
              accessor: "_id" as const,
              render: (_: unknown, row: IndicatorThreshold) => (
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="secondary"
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
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCopy(row);
                    }}
                    className="p-1.5 rounded text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900/30"
                    title={t("indicatorThreshold.copyButton")}
                  >
                    <FaCopy size={14} />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThresholdToDelete(row);
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
    ],
    [t, isSuperAdmin, handleOpenEdit, handleOpenCopy],
  );

  const totalThresholds = thresholds.length;
  const thresholdTotalPages = Math.max(
    1,
    Math.ceil(totalThresholds / thresholdPagination.limit),
  );
  const pagedThresholds = thresholds.slice(
    (thresholdPagination.page - 1) * thresholdPagination.limit,
    thresholdPagination.page * thresholdPagination.limit,
  );

  const createMut = useMutation({
    mutationFn: (p: IndicatorThresholdCreatePayload) =>
      indicatorThresholdService.create(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicator-thresholds"] });
      toast.success(t("indicatorThreshold.toastAddSuccess"));
      handleCloseModal();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { error?: string } } };
      toast.error(
        err?.response?.data?.error ?? t("indicatorThreshold.toastAddError"),
      );
    },
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { x_min: number; x_max: number; unit?: string };
    }) => indicatorThresholdService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicator-thresholds"] });
      toast.success(t("indicatorThreshold.toastUpdateSuccess"));
      handleCloseModal();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { error?: string } } };
      toast.error(
        err?.response?.data?.error ?? t("indicatorThreshold.toastUpdateError"),
      );
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => indicatorThresholdService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicator-thresholds"] });
      toast.success(t("indicatorThreshold.toastDeleteSuccess"));
      setThresholdToDelete(null);
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { error?: string } } };
      toast.error(
        err?.response?.data?.error ?? t("indicatorThreshold.toastDeleteError"),
      );
    },
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingThreshold(null);
    setForm(defaultForm);
    setFormErrors({});
  };

  const handleOpenAdd = () => {
    setForm({
      ...defaultForm,
      unit_id: filterUnitId || "",
      indicator_id: filterIndicatorId || "",
    });
    setIsEditMode(false);
    setEditingThreshold(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      await thresholdSchema.validate(form, { abortEarly: false });
      setFormErrors({});
    } catch (err) {
      const e: Partial<Record<keyof ThresholdFormData, string>> = {};
      (err as yup.ValidationError).inner?.forEach((x) => {
        if (x.path) e[x.path as keyof ThresholdFormData] = x.message;
      });
      setFormErrors(e);
      toast.error(t("indicatorThreshold.validationError"));
      return;
    }
    if (isEditMode && editingThreshold) {
      updateMut.mutate({
        id: editingThreshold._id,
        payload: { x_min: form.x_min, x_max: form.x_max, unit: form.unit },
      });
    } else {
      createMut.mutate({
        indicator_id: form.indicator_id,
        unit_id: form.unit_id,
        x_min: form.x_min,
        x_max: form.x_max,
        unit: form.unit || undefined,
      });
    }
  };

  const wardFilterOptions = [
    { value: "", label: t("indicatorThreshold.filterAllWards") },
    ...wards.map((w) => ({ value: w._id, label: w.name })),
  ];
  const indicatorFilterOptions = [
    { value: "", label: t("indicatorThreshold.filterAllIndicators") },
    ...indicators.map((i) => ({
      value: i._id,
      label: `${i.code} - ${i.name}`,
    })),
  ];

  return (
    <div className="p-6 mx-auto">
      <div
        className={`rounded-2xl border ${themeClasses.border} ${themeClasses.backgroundSecondary} overflow-hidden`}
      >
        <div className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3">
          <h1
            className={`font-semibold text-xl flex items-center gap-2 ${themeClasses.text}`}
          >
            <FaSlidersH size={22} className="text-amber-500" />
            {t("indicatorThreshold.title")}
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 ${themeClasses.text}`}
              title={t("common.refresh")}
            >
              <FaSync className={isLoading ? "animate-spin" : ""} />
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
              >
                <FaPlus size={14} />
                {t("indicatorThreshold.addButton")}
              </button>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            {t("indicatorThreshold.subtitle")}
          </p>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-[180px]">
              <Select
                label={t("indicatorThreshold.filterWard")}
                value={filterUnitId}
                options={wardFilterOptions}
                onChange={(e) => setFilterUnitId(e.target.value)}
              />
            </div>
            <div className="min-w-[220px]">
              <Select
                label={t("indicatorThreshold.filterIndicator")}
                value={filterIndicatorId}
                options={indicatorFilterOptions}
                onChange={(e) => setFilterIndicatorId(e.target.value)}
              />
            </div>
          </div>

          <Table<IndicatorThreshold>
            columns={columns}
            data={pagedThresholds}
            emptyMessage={t("indicatorThreshold.emptyMessage")}
          />
          <Pagination
            page={thresholdPagination.page}
            totalPages={thresholdTotalPages}
            totalItems={totalThresholds}
            pageSize={thresholdPagination.limit}
            onPageChange={(page) =>
              setThresholdPagination((prev) => ({ ...prev, page }))
            }
            label={t("userManagement.paginationShow", {
              from:
                (thresholdPagination.page - 1) * thresholdPagination.limit + 1,
              to: Math.min(
                thresholdPagination.page * thresholdPagination.limit,
                totalThresholds,
              ),
              total: totalThresholds,
            })}
            itemLabel={t("userManagement.paginationItems")}
          />
        </div>
      </div>

      <ThresholdFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
        form={form}
        setForm={setForm}
        wards={wards}
        indicators={indicators}
        errors={formErrors}
        loading={createMut.isPending || updateMut.isPending}
        titleAdd={t("indicatorThreshold.titleAdd")}
        titleEdit={t("indicatorThreshold.titleEdit")}
      />

      <Modal
        isOpen={!!thresholdToDelete}
        onClose={() => setThresholdToDelete(null)}
        title={t("indicatorThreshold.deleteConfirmTitle")}
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setThresholdToDelete(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                thresholdToDelete && deleteMut.mutate(thresholdToDelete._id)
              }
              disabled={deleteMut.isPending}
            >
              {t("common.delete")}
            </Button>
          </div>
        }
      >
        <p className={themeClasses.text}>
          {t("indicatorThreshold.deleteConfirmMessage")}{" "}
          {thresholdToDelete && (
            <>
              <strong>{unitName(thresholdToDelete.unit_id)}</strong> —{" "}
              {indicatorDisplay(thresholdToDelete.indicator_id)} (
              {t("indicatorThreshold.labelXMin")}: {formatNumber(thresholdToDelete.x_min, 2)},{" "}
              {t("indicatorThreshold.labelXMax")}: {formatNumber(thresholdToDelete.x_max, 2)})?
            </>
          )}
        </p>
      </Modal>
    </div>
  );
}
