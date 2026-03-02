/**
 * Quản lý Phường & Chỉ số Rủi ro - UI thống nhất
 * Gộp danh sách phường và 5 chỉ số (Địa hình, Triều cường, Lượng mưa, Dân số, Mật độ cống) theo phường + năm
 */
import { useState, useMemo } from "react";

/** Thứ tự AHP: C1 Địa hình, C2 Triều cường, C3 Lượng mưa, C4 Dân số, C5 Mật độ cống */
const AHP_ORDER = ["H", "T", "P", "POP", "D"];
const DEFAULT_AHP_MATRIX_5: number[][] = [
  [1, 2, 3, 5, 4],
  [1 / 2, 1, 2, 4, 3],
  [1 / 3, 1 / 2, 1, 3, 2],
  [1 / 5, 1 / 4, 1 / 3, 1, 1 / 2],
  [1 / 4, 1 / 3, 1 / 2, 2, 1],
];
import {
  FaMapMarkedAlt,
  FaChartLine,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSync,
  FaUpload,
} from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { Input, Modal, Button } from "../../components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatNumber } from "../../utils/formatUtils";
import toast from "react-hot-toast";
import * as yup from "yup";
import {
  administrativeUnitService,
  type AdministrativeUnit,
  type AdministrativeUnitCreatePayload,
  type AdministrativeUnitGeom,
} from "../../services/administrativeUnitService";
import {
  indicatorValueService,
  floodIndicatorService,
  type IndicatorValueRecord,
  type FloodIndicator,
} from "../../services/indicatorValueService";
import { riskAssessmentService } from "../../services/riskAssessmentService";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../constants/roles";
import {
  calculateAHP,
  createEmptyAHPMatrix,
  setMatrixCell,
  type AHPResult,
} from "../../utils/ahpUtils";
import { getIndicatorLabel } from "../../utils/indicatorLabels";

// --- Helpers ---
function createPolygonFromCenter(
  lat: number,
  lng: number,
): AdministrativeUnitGeom {
  const delta = 0.002;
  return {
    type: "Polygon",
    coordinates: [
      [
        [lng - delta, lat - delta],
        [lng + delta, lat - delta],
        [lng + delta, lat + delta],
        [lng - delta, lat + delta],
        [lng - delta, lat - delta],
      ],
    ],
  };
}

function extractCenterFromGeom(
  geom: AdministrativeUnitGeom | null,
): [number, number] | null {
  if (!geom?.coordinates) return null;
  const coords = geom.coordinates;
  if (geom.type === "Polygon" && Array.isArray(coords) && coords[0]?.length) {
    const ring = coords[0] as number[][];
    if (ring[0]?.length >= 2) return [ring[0][1], ring[0][0]];
  }
  if (
    geom.type === "MultiPolygon" &&
    Array.isArray(coords) &&
    coords[0]?.[0]?.[0]
  ) {
    const first = (coords[0] as number[][][])[0][0];
    return [first[1], first[0]];
  }
  return null;
}

/** Chuẩn hóa tạm cho H, D (backend dùng raw/100). T, P, POP dùng min-max ở backend. */
function toNormalizedFallback(raw: number): number {
  return Math.min(1, Math.max(0, Number(raw) / 100));
}

interface WardYearIndicatorRow {
  unit_id: string;
  unit_name: string;
  data_year: number;
  H?: { _id: string; raw_value: number; normalized_value: number };
  T?: { _id: string; raw_value: number; normalized_value: number };
  P?: { _id: string; raw_value: number; normalized_value: number };
  D?: { _id: string; raw_value: number; normalized_value: number };
  POP?: { _id: string; raw_value: number; normalized_value: number };
}

const createWardSchema = yup.object().shape({
  name: yup.string().required("Tên phường là bắt buộc").trim().max(100),
  area_km2: yup.number().min(0).required("Diện tích là bắt buộc"),
  coordinates: yup
    .string()
    .required("Tọa độ bắt buộc (lat,lng)")
    .test("coords", "Tọa độ không hợp lệ", (v) => {
      if (!v?.trim()) return false;
      const p = v.split(",").map((c) => parseFloat(c.trim()));
      return p.length >= 2 && !isNaN(p[0]) && !isNaN(p[1]);
    }),
});

const updateWardSchema = createWardSchema;

export default function WardManagementPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

  // Ward state
  const [wardPagination, setWardPagination] = useState({ page: 1, limit: 8 });
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [wardModalOpen, setWardModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<AdministrativeUnit | null>(
    null,
  );
  const [wardToDelete, setWardToDelete] = useState<AdministrativeUnit | null>(
    null,
  );
  const [wardForm, setWardForm] = useState({
    name: "",
    area_km2: 0,
    coordinates: "",
  });
  const [wardErrors, setWardErrors] = useState<Record<string, string>>({});

  // Indicator state
  const [indicatorPagination, setIndicatorPagination] = useState({
    page: 1,
    limit: 8,
  });
  const [yearFilter, setYearFilter] = useState<number | "">("");
  const [indicatorModalOpen, setIndicatorModalOpen] = useState(false);
  const [editingIndicatorRow, setEditingIndicatorRow] =
    useState<WardYearIndicatorRow | null>(null);
  const [indicatorToDelete, setIndicatorToDelete] =
    useState<WardYearIndicatorRow | null>(null);
  const [indicatorForm, setIndicatorForm] = useState({
    unit_id: "",
    data_year: new Date().getFullYear(),
    H: 0,
    T: 0,
    P: 0,
    D: 0,
    POP: 0,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [ahpModalOpen, setAhpModalOpen] = useState(false);
  const [ahpMatrix, setAhpMatrix] = useState<number[][]>([]);
  const [ahpResult, setAhpResult] = useState<AHPResult | null>(null);

  const indicatorCodes = ["H", "T", "P", "D", "POP"];
  const indicatorUnitFallback: Record<string, string> = {
    H: "m",
    T: "cm",
    P: "mm",
    D: "cống/km²",
    POP: "người/km²",
  };

  // Queries
  const {
    data: wardsData,
    isLoading: loadingWards,
    refetch: refetchWards,
  } = useQuery({
    queryKey: [
      "administrative-units",
      "management",
      wardPagination.page,
      wardPagination.limit,
    ],
    queryFn: () =>
      administrativeUnitService.getUnits({
        page: wardPagination.page,
        limit: wardPagination.limit,
      }),
  });

  const { data: allUnitsData } = useQuery({
    queryKey: ["administrative-units", "all"],
    queryFn: () => administrativeUnitService.getAllUnits(),
  });

  const { data: indicatorsData } = useQuery({
    queryKey: ["flood-indicators"],
    queryFn: () => floodIndicatorService.getIndicators(),
  });

  const {
    data: valuesData,
    isLoading: loadingIndicators,
    refetch: refetchIndicators,
  } = useQuery({
    queryKey: ["indicator-values", yearFilter, selectedWardId],
    queryFn: () => {
      const params: { year?: number; unit_id?: string } = {};
      if (yearFilter) params.year = Number(yearFilter);
      if (selectedWardId) params.unit_id = selectedWardId;
      return indicatorValueService.getValues(params);
    },
  });

  const wards: AdministrativeUnit[] = wardsData?.data ?? [];
  const allUnits = allUnitsData?.data ?? [];
  const indicators: FloodIndicator[] = indicatorsData?.data ?? [];
  const values: IndicatorValueRecord[] = valuesData?.data ?? [];

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

  const wardPaginationData = wardsData?.pagination ?? wardPagination;
  const unitIdToName = useMemo(() => {
    const m: Record<string, string> = {};
    allUnits.forEach((u) => (m[u._id] = u.name));
    return m;
  }, [allUnits]);

  const codeToId = useMemo(() => {
    const m: Record<string, string> = {};
    indicators.forEach((i) => (m[i.code] = i._id));
    return m;
  }, [indicators]);

  const groupedIndicatorRows: WardYearIndicatorRow[] = useMemo(() => {
    const map = new Map<string, WardYearIndicatorRow>();
    for (const v of values) {
      const uid = typeof v.unit_id === "object" ? v.unit_id._id : v.unit_id;
      const code =
        typeof v.indicator_id === "object"
          ? (v.indicator_id as { code: string }).code
          : "";
      const unitName =
        typeof v.unit_id === "object"
          ? (v.unit_id as { name: string }).name
          : (unitIdToName[uid] ?? uid);
      const key = `${uid}|${v.data_year}`;
      if (!map.has(key)) {
        map.set(key, {
          unit_id: uid,
          unit_name: unitName,
          data_year: v.data_year,
        });
      }
      const row = map.get(key)!;
      if (indicatorCodes.includes(code)) {
        (row as any)[code] = {
          _id: v._id,
          raw_value: v.raw_value,
          normalized_value: v.normalized_value,
        };
      }
    }
    return Array.from(map.values()).sort(
      (a, b) =>
        b.data_year - a.data_year || a.unit_name.localeCompare(b.unit_name),
    );
  }, [values, unitIdToName]);

  const indicatorPageData = useMemo(() => {
    const start = (indicatorPagination.page - 1) * indicatorPagination.limit;
    return groupedIndicatorRows.slice(start, start + indicatorPagination.limit);
  }, [groupedIndicatorRows, indicatorPagination]);

  const indicatorPages = Math.max(
    1,
    Math.ceil(groupedIndicatorRows.length / indicatorPagination.limit),
  );

  // Ward mutations
  const createWardMut = useMutation({
    mutationFn: (p: AdministrativeUnitCreatePayload) =>
      administrativeUnitService.createUnit(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administrative-units"] });
      toast.success("Thêm phường thành công!");
      setWardModalOpen(false);
      setWardForm({ name: "", area_km2: 0, coordinates: "" });
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Lỗi khi thêm phường",
      );
    },
  });

  const updateWardMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AdministrativeUnitCreatePayload;
    }) => administrativeUnitService.updateUnit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administrative-units"] });
      toast.success("Cập nhật phường thành công!");
      setWardModalOpen(false);
      setEditingWard(null);
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Lỗi khi cập nhật",
      );
    },
  });

  const deleteWardMut = useMutation({
    mutationFn: (id: string) => administrativeUnitService.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administrative-units"] });
      toast.success("Đã xóa phường.");
      setWardToDelete(null);
      if (wardToDelete && selectedWardId === wardToDelete._id)
        setSelectedWardId(null);
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Lỗi khi xóa",
      );
    },
  });

  // Indicator mutations
  const bulkUpsertIndicators = useMutation({
    mutationFn: (
      items: Parameters<typeof indicatorValueService.bulkUpsert>[0],
    ) => indicatorValueService.bulkUpsert(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicator-values"] });
      toast.success("Đã lưu chỉ số!");
      setIndicatorModalOpen(false);
      setEditingIndicatorRow(null);
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Lỗi khi lưu",
      );
    },
  });

  const deleteIndicatorsMut = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) await indicatorValueService.deleteValue(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicator-values"] });
      toast.success("Đã xóa chỉ số.");
      setIndicatorToDelete(null);
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
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      const msg = err?.response?.data?.error || err?.message || "Lỗi khi lưu trọng số";
      toast.error(msg);
    },
  });

  const refreshAssessmentsMut = useMutation({
    mutationFn: (year?: number) => riskAssessmentService.refreshAssessments(year),
    onSuccess: (data) => {
      toast.success(data.message || "Đã tính lại đánh giá rủi ro!");
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      toast.error(err?.response?.data?.error || err?.message || "Lỗi khi tính đánh giá");
    },
  });

  const handleWardSubmit = async () => {
    const schema = editingWard ? updateWardSchema : createWardSchema;
    try {
      await schema.validate(wardForm, { abortEarly: false });
      setWardErrors({});
    } catch (err) {
      const e: Record<string, string> = {};
      (err as yup.ValidationError).inner?.forEach((x) => {
        if (x.path) e[x.path] = x.message;
      });
      setWardErrors(e);
      return;
    }
    const [lat, lng] = wardForm.coordinates
      .split(",")
      .map((c) => parseFloat(c.trim()));
    const geom = createPolygonFromCenter(lat, lng);
    const payload = {
      name: wardForm.name.trim(),
      area_km2: wardForm.area_km2,
      geom,
    };
    if (editingWard) {
      updateWardMut.mutate({ id: editingWard._id, payload });
    } else {
      createWardMut.mutate(payload);
    }
  };

  const handleIndicatorSubmit = () => {
    if (!indicatorForm.unit_id) {
      toast.error("Chọn phường");
      return;
    }
    const items = indicatorCodes
      .filter((c) => codeToId[c])
      .map((c) => {
        const val = (indicatorForm as any)[c];
        const raw =
          val === undefined || val === null || val === "" ? 0 : Number(val);
        const num = isNaN(raw) ? 0 : raw;
        return {
          unit_id: indicatorForm.unit_id,
          indicator_id: codeToId[c],
          data_year: indicatorForm.data_year,
          raw_value: num,
          normalized_value: toNormalizedFallback(num),
        };
      });
    bulkUpsertIndicators.mutate(items);
  };

  const collectIndicatorIds = (row: WardYearIndicatorRow): string[] => {
    const ids: string[] = [];
    indicatorCodes.forEach((c) => {
      const v = (row as any)[c];
      if (v?._id) ids.push(v._id);
    });
    return ids;
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !isSuperAdmin) return;
    setIsUploading(true);
    try {
      const text = await f.text();
      const lines = text
        .replace(/^\uFEFF/, "")
        .trim()
        .split("\n");
      if (lines.length < 2) {
        toast.error("File không có dữ liệu");
        return;
      }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const unitIdx = headers.findIndex(
        (h) => h.includes("unit") || h === "mã phường",
      );
      const yearIdx = headers.findIndex(
        (h) => h.includes("year") || h.includes("năm"),
      );
      const idxs = indicatorCodes.map((c) =>
        headers.findIndex(
          (h) => h === c.toLowerCase() || h.includes(c.toLowerCase()),
        ),
      );
      const unitNameToId = Object.fromEntries(
        allUnits.map((u) => [u.name, u._id]),
      );
      const unitIdSet = new Set(allUnits.map((u) => u._id));
      const items: Array<{
        unit_id: string;
        indicator_id: string;
        data_year: number;
        raw_value: number;
        normalized_value: number;
      }> = [];

      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(",").map((v) => v.trim());
        const unitVal = unitIdx >= 0 ? vals[unitIdx] : "";
        const unitId = unitIdSet.has(unitVal)
          ? unitVal
          : unitNameToId[unitVal] || unitVal;
        const year =
          parseInt(yearIdx >= 0 ? vals[yearIdx] : "0") ||
          new Date().getFullYear();
        if (!unitId || !year) continue;
        indicatorCodes.forEach((code, c) => {
          const idx = idxs[c];
          if (idx < 0 || !codeToId[code]) return;
          const raw = Math.max(0, parseFloat(vals[idx] || "0") || 0);
          items.push({
            unit_id: unitId,
            indicator_id: codeToId[code],
            data_year: year,
            raw_value: raw,
            normalized_value: toNormalizedFallback(raw),
          });
        });
      }
      if (items.length === 0) {
        toast.error("Không có dữ liệu hợp lệ");
        return;
      }
      await indicatorValueService.bulkUpsert(items);
      toast.success(`Đã import ${items.length / 5} bản ghi`);
      queryClient.invalidateQueries({ queryKey: ["indicator-values"] });
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi import CSV");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const selectedWardName = selectedWardId
    ? (unitIdToName[selectedWardId] ?? "Phường")
    : null;

  return (
    <div
      className={`min-h-full ${themeClasses.background}`}
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`p-2 rounded-xl ${
              theme === "light" ? "bg-indigo-100" : "bg-indigo-900/30"
            }`}
          >
            <FaMapMarkedAlt
              className={
                theme === "light" ? "text-indigo-600" : "text-indigo-400"
              }
              size={28}
            />
          </div>
          <div>
            <h1
              className={`text-2xl md:text-3xl font-bold ${themeClasses.text}`}
            >
              Quản lý Phường & Chỉ số Rủi ro
            </h1>
            <p className={`text-sm mt-1 ${themeClasses.textSecondary}`}>
              Quản lý danh sách phường và 5 chỉ số (Địa hình, Triều cường, Lượng mưa, Dân số, Mật độ cống) theo phường
              và năm
            </p>
          </div>
        </div>
      </div>

      <div className="px-2">
        {/* Panel 1: Danh sách Phường */}
        <div
          className={`rounded-2xl border ${themeClasses.border} ${themeClasses.backgroundSecondary} overflow-hidden`}
        >
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2
              className={`font-semibold text-lg flex items-center gap-2 ${themeClasses.text}`}
            >
              <FaMapMarkedAlt size={20} className="text-indigo-500" />
              Danh sách Phường
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetchWards()}
                disabled={loadingWards}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Làm mới"
              >
                <FaSync className={loadingWards ? "animate-spin" : ""} />
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => {
                    setEditingWard(null);
                    setWardForm({ name: "", area_km2: 0, coordinates: "" });
                    setWardErrors({});
                    setWardModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
                >
                  <FaPlus size={14} />
                  Thêm
                </button>
              )}
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {wards.map((w) => (
                <button
                  key={w._id}
                  onClick={() =>
                    setSelectedWardId((id) => (id === w._id ? null : w._id))
                  }
                  className={`p-4 rounded-xl text-left transition-all ${
                    selectedWardId === w._id
                      ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : theme === "light"
                        ? "bg-white hover:bg-gray-50 border border-gray-200"
                        : "bg-gray-800/50 hover:bg-gray-800 border border-gray-700"
                  }`}
                >
                  <div className={`font-medium truncate ${themeClasses.text}`}>
                    {w.name}
                  </div>
                  <div className={`text-xs mt-1 ${themeClasses.textSecondary}`}>
                    {formatNumber(w.area_km2)} km²
                  </div>
                  {isSuperAdmin && (
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setEditingWard(w);
                          const c = extractCenterFromGeom(w.geom);
                          setWardForm({
                            name: w.name,
                            area_km2: w.area_km2 ?? 0,
                            coordinates: c ? `${c[0]}, ${c[1]}` : "",
                          });
                          setWardModalOpen(true);
                        }}
                        className="p-1.5 rounded text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setWardToDelete(w);
                        }}
                        className="p-1.5 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {wards.length === 0 && !loadingWards && (
              <p className={`text-center py-8 ${themeClasses.textSecondary}`}>
                Chưa có phường
              </p>
            )}
            {wardPaginationData.pages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() =>
                    setWardPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                  disabled={wardPagination.page <= 1 || loadingWards}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                >
                  ‹
                </button>
                <span className="px-3 py-1 text-sm">
                  {wardPagination.page} / {wardPaginationData.pages}
                </span>
                <button
                  onClick={() =>
                    setWardPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                  disabled={
                    wardPagination.page >= wardPaginationData.pages ||
                    loadingWards
                  }
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Chỉ số theo Phường */}
        <div
          className={`rounded-2xl border ${themeClasses.border} ${themeClasses.backgroundSecondary} overflow-hidden`}
        >
          <div className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3">
            <h2
              className={`font-semibold text-lg flex items-center gap-2 ${themeClasses.text}`}
            >
              <FaChartLine size={20} className="text-amber-500" />
              Chỉ số Rủi ro
              {selectedWardName && (
                <span className="text-sm font-normal text-indigo-600 dark:text-indigo-400">
                  — {selectedWardName}
                </span>
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedWardId ?? ""}
                onChange={(e) => setSelectedWardId(e.target.value || null)}
                className="px-2 py-1.5 rounded-lg border text-sm bg-white dark:bg-gray-800"
              >
                <option value="">Tất cả phường</option>
                {allUnits.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <select
                value={yearFilter}
                onChange={(e) =>
                  setYearFilter(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="px-2 py-1.5 rounded-lg border text-sm bg-white dark:bg-gray-800"
              >
                <option value="">Tất cả năm</option>
                {Array.from(
                  { length: 8 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button
                onClick={() => refetchIndicators()}
                disabled={loadingIndicators}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <FaSync className={loadingIndicators ? "animate-spin" : ""} />
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
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium"
                  >
                    <FaChartLine size={14} />
                    AHP
                  </button>
                  <button
                    onClick={() =>
                      refreshAssessmentsMut.mutate(
                        yearFilter ? Number(yearFilter) : undefined
                      )
                    }
                    disabled={refreshAssessmentsMut.isPending}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium"
                    title="Tính RI = Σ(weight × normalized_value) và cập nhật risk_assessments"
                  >
                    <FaSync
                      className={
                        refreshAssessmentsMut.isPending ? "animate-spin" : ""
                      }
                    />
                    Tính lại đánh giá
                  </button>
                  <label
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                      theme === "light"
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-indigo-500 hover:bg-indigo-600"
                    } text-white ${isUploading ? "opacity-50" : ""}`}
                  >
                    <FaUpload size={14} />
                    CSV
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      disabled={isUploading}
                      onChange={handleCsvUpload}
                    />
                  </label>
                  <button
                    onClick={() => {
                      setEditingIndicatorRow(null);
                      setIndicatorForm({
                        unit_id: selectedWardId ?? allUnits[0]?._id ?? "",
                        data_year: new Date().getFullYear(),
                        H: 0,
                        T: 0,
                        P: 0,
                        D: 0,
                        POP: 0,
                      });
                      setIndicatorModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
                  >
                    <FaPlus size={14} />
                    Thêm
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${themeClasses.border}`}>
                  <th className="text-left py-2 px-2 font-medium">Phường</th>
                  <th className="text-left py-2 px-2 font-medium">Năm</th>
                  {indicatorCodes.map((c) => {
                    const ind = indicators.find((i) => i.code === c);
                    const indOrCode = ind ?? { code: c };
                    const unit = ind?.unit ?? indicatorUnitFallback[c];
                    const unitStr = unit ? ` (${unit})` : "";
                    const dir = ind?.direction ?? 1;
                    return (
                      <th
                        key={c}
                        className="text-center py-2 px-2 font-medium"
                        title={getIndicatorLabel(indOrCode)}
                      >
                        <div>
                          {getIndicatorLabel(indOrCode)} {unitStr}
                        </div>
                        <div
                          className={`text-xs font-normal ${themeClasses.textSecondary}`}
                        >
                          ký hiệu: {c}
                          <span
                            className={`ml-1 px-1 rounded text-[10px] ${
                              dir === 0
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            }`}
                          >
                            {dir === 0 ? "Nghịch" : "Thuận"}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                  {isSuperAdmin && (
                    <th className="text-right py-2 px-2 font-medium">
                      Thao tác
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {indicatorPageData.map((row) => (
                  <tr
                    key={`${row.unit_id}-${row.data_year}`}
                    className={`border-b ${themeClasses.border} hover:bg-gray-50 dark:hover:bg-gray-800/50`}
                  >
                    <td className="py-2 px-2">{row.unit_name}</td>
                    <td className="py-2 px-2">{row.data_year}</td>
                    {indicatorCodes.map((c) => {
                      const v = (row as any)[c];
                      if (v == null)
                        return (
                          <td key={c} className="text-center py-2 px-2">
                            -
                          </td>
                        );
                      const ind = indicators.find((i) => i.code === c);
                      const unitStr =
                        (ind?.unit ?? indicatorUnitFallback[c])
                          ? ` ${ind?.unit ?? indicatorUnitFallback[c]}`
                          : "";
                      return (
                        <td key={c} className="text-center py-2 px-2">
                          <div className="font-medium">
                            {formatNumber(v.raw_value)}
                            {unitStr && (
                              <span
                                className={`text-xs font-normal ${themeClasses.textSecondary}`}
                              >
                                {unitStr}
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-xs ${themeClasses.textSecondary}`}
                            title="Chuẩn hóa"
                          >
                            → {v.normalized_value.toFixed(2)}
                          </div>
                        </td>
                      );
                    })}
                    {isSuperAdmin && (
                      <td className="py-2 px-2 text-right">
                        <button
                          onClick={() => {
                            setEditingIndicatorRow(row);
                            setIndicatorForm({
                              unit_id: row.unit_id,
                              data_year: row.data_year,
                              H: row.H?.raw_value ?? 0,
                              T: row.T?.raw_value ?? 0,
                              P: row.P?.raw_value ?? 0,
                              D: row.D?.raw_value ?? 0,
                              POP: row.POP?.raw_value ?? 0,
                            });
                            setIndicatorModalOpen(true);
                          }}
                          className="p-1.5 rounded text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={() => setIndicatorToDelete(row)}
                          className="p-1.5 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 ml-1"
                        >
                          <FaTrash size={12} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {groupedIndicatorRows.length === 0 && !loadingIndicators && (
              <p className={`text-center py-8 ${themeClasses.textSecondary}`}>
                Chưa có chỉ số. Chọn phường và thêm dữ liệu.
              </p>
            )}
            {indicatorPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() =>
                    setIndicatorPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                  disabled={indicatorPagination.page <= 1 || loadingIndicators}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                >
                  ‹
                </button>
                <span className="px-3 py-1 text-sm">
                  {indicatorPagination.page} / {indicatorPages} —{" "}
                  {groupedIndicatorRows.length} bản ghi
                </span>
                <button
                  onClick={() =>
                    setIndicatorPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                  disabled={
                    indicatorPagination.page >= indicatorPages ||
                    loadingIndicators
                  }
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ward Modal */}
      <Modal
        isOpen={wardModalOpen}
        onClose={() => {
          setWardModalOpen(false);
          setEditingWard(null);
          setWardForm({ name: "", area_km2: 0, coordinates: "" });
        }}
        title={editingWard ? "Chỉnh sửa phường" : "Thêm phường"}
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setWardModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleWardSubmit}
              disabled={createWardMut.isPending || updateWardMut.isPending}
            >
              {editingWard ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tên phường *"
            value={wardForm.name}
            onChange={(e) =>
              setWardForm((p) => ({ ...p, name: e.target.value }))
            }
            error={wardErrors.name}
            placeholder="Ví dụ: Phường Linh Trung"
          />
          <Input
            label="Diện tích (km²) *"
            type="number"
            step="0.01"
            min={0}
            value={wardForm.area_km2 || ""}
            onChange={(e) =>
              setWardForm((p) => ({
                ...p,
                area_km2: parseFloat(e.target.value) || 0,
              }))
            }
            error={wardErrors.area_km2}
          />
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${themeClasses.text}`}
            >
              Tọa độ (lat,lng) *
            </label>
            <input
              type="text"
              value={wardForm.coordinates}
              onChange={(e) =>
                setWardForm((p) => ({ ...p, coordinates: e.target.value }))
              }
              placeholder="10.7769, 106.7009"
              className={`w-full px-3 py-2 border rounded-lg ${
                wardErrors.coordinates ? "border-red-500" : ""
              } ${theme === "light" ? "bg-white" : "bg-gray-800"}`}
            />
            {wardErrors.coordinates && (
              <p className="text-sm text-red-500 mt-1">
                {wardErrors.coordinates}
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Ward Delete Modal */}
      <Modal
        isOpen={!!wardToDelete}
        onClose={() => setWardToDelete(null)}
        title="Xác nhận xóa"
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setWardToDelete(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                wardToDelete && deleteWardMut.mutate(wardToDelete._id)
              }
              disabled={deleteWardMut.isPending}
            >
              Xóa
            </Button>
          </div>
        }
      >
        <p className={themeClasses.text}>
          Xóa phường <strong>{wardToDelete?.name}</strong>? Hành động không thể
          hoàn tác.
        </p>
      </Modal>

      {/* Indicator Modal */}
      <Modal
        isOpen={indicatorModalOpen}
        onClose={() => {
          setIndicatorModalOpen(false);
          setEditingIndicatorRow(null);
        }}
        title={(() => {
          const units = indicatorCodes
            .map((c) => {
              const ind = indicators.find((i) => i.code === c);
              const u = ind?.unit ?? indicatorUnitFallback[c];
              return u ? `${c}=${u}` : c;
            })
            .join(", ");
          const base = editingIndicatorRow
            ? "Chỉnh sửa chỉ số"
            : "Thêm chỉ số theo phường và năm";
          return `${base} — Đơn vị: ${units}`;
        })()}
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIndicatorModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleIndicatorSubmit}
              disabled={bulkUpsertIndicators.isPending}
            >
              Lưu
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${themeClasses.text}`}
            >
              Phường *
            </label>
            <select
              value={indicatorForm.unit_id}
              onChange={(e) =>
                setIndicatorForm((p) => ({ ...p, unit_id: e.target.value }))
              }
              disabled={!!editingIndicatorRow}
              className={`w-full px-3 py-2 border rounded-lg ${
                theme === "light" ? "bg-white" : "bg-gray-800"
              }`}
            >
              <option value="">-- Chọn phường --</option>
              {allUnits.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Năm *"
            type="number"
            min={2000}
            max={2100}
            value={indicatorForm.data_year}
            onChange={(e) =>
              setIndicatorForm((p) => ({
                ...p,
                data_year: Number(e.target.value) || new Date().getFullYear(),
              }))
            }
            disabled={!!editingIndicatorRow}
          />
          <div className="grid grid-cols-2 gap-4">
            {indicatorCodes.map((code) => {
              const ind = indicators.find((i) => i.code === code);
              const unit = ind?.unit ?? indicatorUnitFallback[code];
              return (
                <Input
                  key={code}
                  label={`${code}${ind ? ` - ${ind.name}` : ""}${unit ? ` (${unit})` : ""}`}
                  type="number"
                  step="0.01"
                  min={0}
                  value={(indicatorForm as any)[code] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    const next =
                      v === ""
                        ? undefined
                        : (() => {
                            const n = parseFloat(v);
                            return isNaN(n) ? undefined : n;
                          })();
                    setIndicatorForm((p) => ({ ...p, [code]: next }));
                  }}
                />
              );
            })}
          </div>
          <p className={`text-xs ${themeClasses.textSecondary}`}>
            T, P, POP: (giá trị − min) / (max − min). H, D: (max − giá trị) /
            (max − min).
          </p>
        </div>
      </Modal>

      {/* Indicator Delete Modal */}
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
                indicatorToDelete &&
                deleteIndicatorsMut.mutate(
                  collectIndicatorIds(indicatorToDelete),
                )
              }
              disabled={deleteIndicatorsMut.isPending}
            >
              Xóa
            </Button>
          </div>
        }
      >
        <p className={themeClasses.text}>
          Xóa 5 chỉ số của phường{" "}
          <strong>{indicatorToDelete?.unit_name}</strong> năm{" "}
          <strong>{indicatorToDelete?.data_year}</strong>?
        </p>
      </Modal>

      {/* AHP Modal */}
      <Modal
        isOpen={ahpModalOpen}
        onClose={() => setAhpModalOpen(false)}
        title="Phân tích thứ bậc (AHP)"
        maxWidth="xl"
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
            1 = bằng nhau, 2–4–6 = trị trung gian, 3 = quan trọng hơn, 5 = rất quan trọng, 7–9 = cực kỳ. Chỉ nhập tam giác trên (ô [i] so với [j], i &lt; j).
          </p>
          {indicatorsInAHOrder.length === 0 ? (
            <p className={themeClasses.textSecondary}>
              Chưa có chỉ số. Thêm chỉ số trong flood_indicators trước.
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
                                className={`w-14 px-1 py-0.5 text-center rounded border ${
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
                      .join(", ")}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
