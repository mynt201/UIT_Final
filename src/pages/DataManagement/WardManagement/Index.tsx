import { useState, useMemo } from 'react';
import { FaMapMarkedAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '../../../constants/roles';
import {
  administrativeUnitService,
  type AdministrativeUnit,
  type AdministrativeUnitCreatePayload,
} from '../../../services/administrativeUnitService';
import {
  indicatorValueService,
  floodIndicatorService,
  type IndicatorValueRecord,
  type FloodIndicator,
} from '../../../services/indicatorValueService';
import { riskAssessmentService } from '../../../services/riskAssessmentService';
import { formatNumber } from '../../../utils/formatUtils';
import { getIndicatorLabel } from '../../../utils/indicatorLabels';
import { createEmptyAHPMatrix } from '../../../utils/ahpUtils';

import type { WardYearIndicatorRow, IndicatorCell } from './types';
import { LEGACY_AHP_ORDER } from './constants';
import { extractCenterFromGeom } from './utils';

import WardListPanel from './Partials/WardListPanel';
import WardFormModal, { type WardFormData } from './Partials/WardFormModal';
import WardDeleteModal from './Partials/WardDeleteModal';
import IndicatorTablePanel from './Partials/IndicatorTablePanel';
import WardIndicatorFormModal from './Partials/WardIndicatorFormModal';
import WardIndicatorDeleteModal from './Partials/WardIndicatorDeleteModal';
import AhpMatrixModal from './Partials/AhpMatrixModal';
import { DEFAULT_AHP_MATRIX_5 } from './constants';
import { Button } from '../../../components';

export default function WardManagementPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const isSuperAdmin = (currentUser?.role as string) === UserRole.SUPER_ADMIN;

  // Ward state
  const [wardPagination, setWardPagination] = useState({ page: 1, limit: 8 });
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [wardModalOpen, setWardModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<AdministrativeUnit | null>(null);
  const [wardToDelete, setWardToDelete] = useState<AdministrativeUnit | null>(null);
  const [wardForm, setWardForm] = useState<WardFormData>({
    name: '',
    area_km2: 0,
    coordinates: '',
  });
  const [wardErrors, setWardErrors] = useState<Record<string, string>>({});

  // Indicator state
  const [indicatorPagination, setIndicatorPagination] = useState({ page: 1, limit: 8 });
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [indicatorModalOpen, setIndicatorModalOpen] = useState(false);
  const [editingIndicatorRow, setEditingIndicatorRow] = useState<WardYearIndicatorRow | null>(null);
  const [indicatorToDelete, setIndicatorToDelete] = useState<WardYearIndicatorRow | null>(null);
  const [indicatorForm, setIndicatorForm] = useState<Record<string, string | number>>({
    unit_id: '',
    data_year: new Date().getFullYear(),
  });
  const [isUploading, setIsUploading] = useState(false);
  const [ahpModalOpen, setAhpModalOpen] = useState(false);
  const [ahpMatrix, setAhpMatrix] = useState<number[][]>([]);
  const [ahpResult, setAhpResult] = useState<{
    weights: number[];
    consistencyRatio: number;
    isValid: boolean;
  } | null>(null);

  // Queries
  const {
    data: wardsData,
    isLoading: loadingWards,
    refetch: refetchWards,
  } = useQuery({
    queryKey: ['administrative-units', 'management', wardPagination.page, wardPagination.limit],
    queryFn: () =>
      administrativeUnitService.getUnits({
        page: wardPagination.page,
        limit: wardPagination.limit,
      }),
  });

  const { data: allUnitsData } = useQuery({
    queryKey: ['administrative-units', 'all'],
    queryFn: () => administrativeUnitService.getAllUnits(),
  });

  const { data: indicatorsData } = useQuery({
    queryKey: ['flood-indicators'],
    queryFn: () => floodIndicatorService.getIndicators(),
  });

  const {
    data: valuesData,
    isLoading: loadingIndicators,
    refetch: refetchIndicators,
  } = useQuery({
    queryKey: ['indicator-values', yearFilter, selectedWardId],
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

  const indicatorCodes = useMemo(() => indicators.map((i) => i.code).sort(), [indicators]);
  const indicatorUnitFallback = useMemo(
    () => Object.fromEntries(indicators.map((i) => [i.code, i.unit ?? ''])),
    [indicators]
  );

  const indicatorsInAHOrder = useMemo(() => {
    const codeToInd = Object.fromEntries(indicators.map((i) => [i.code, i]));
    const ordered: FloodIndicator[] = [];
    for (const code of LEGACY_AHP_ORDER) {
      if (codeToInd[code]) ordered.push(codeToInd[code]);
    }
    for (const ind of indicators) {
      if (!LEGACY_AHP_ORDER.includes(ind.code)) ordered.push(ind);
    }
    return ordered;
  }, [indicators]);

  const wardPaginationData =
    wardsData?.pagination ??
    ({ ...wardPagination, pages: 1, total: 0 } as {
      page: number;
      limit: number;
      pages: number;
      total: number;
    });

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
      const uid = typeof v.unit_id === 'object' ? v.unit_id._id : v.unit_id;
      const code =
        typeof v.indicator_id === 'object' ? (v.indicator_id as { code: string }).code : '';
      const unitName =
        typeof v.unit_id === 'object'
          ? (v.unit_id as { name: string }).name
          : unitIdToName[uid] ?? uid;
      const key = `${uid}|${v.data_year}`;
      if (!map.has(key)) {
        map.set(key, { unit_id: uid, unit_name: unitName, data_year: v.data_year });
      }
      const row = map.get(key)!;
      if (indicatorCodes.includes(code)) {
        (row as WardYearIndicatorRow)[code] = {
          _id: v._id,
          raw_value: v.raw_value,
          normalized_value: v.normalized_value,
        };
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => b.data_year - a.data_year || a.unit_name.localeCompare(b.unit_name)
    );
  }, [values, unitIdToName, indicatorCodes]);

  const indicatorPageData = useMemo(() => {
    const start = (indicatorPagination.page - 1) * indicatorPagination.limit;
    return groupedIndicatorRows.slice(start, start + indicatorPagination.limit);
  }, [groupedIndicatorRows, indicatorPagination]);

  const indicatorPages = Math.max(
    1,
    Math.ceil(groupedIndicatorRows.length / indicatorPagination.limit)
  );

  const indicatorTableColumns = useMemo(() => {
    const cols: Array<{
      header: string;
      accessor: keyof WardYearIndicatorRow | string;
      render?: (value: unknown, row: WardYearIndicatorRow) => React.ReactNode;
    }> = [
      { header: 'Phường', accessor: 'unit_name' },
      { header: 'Năm', accessor: 'data_year' },
      ...indicatorCodes.map((c) => {
        const ind = indicators.find((i) => i.code === c);
        const indOrCode = ind ?? { code: c };
        const unit = ind?.unit ?? indicatorUnitFallback[c];
        const unitStr = unit ? ` (${unit})` : '';
        const dir = ind?.direction ?? 1;
        return {
          header: `${getIndicatorLabel(indOrCode)}${unitStr} [${dir === 0 ? 'Nghịch' : 'Thuận'}]`,
          accessor: c,
          render: (_value: unknown, row: WardYearIndicatorRow) => {
            const v = row[c] as IndicatorCell | undefined;
            if (v == null) return '-';
            const uStr =
              ind?.unit ?? indicatorUnitFallback[c]
                ? ` ${ind?.unit ?? indicatorUnitFallback[c]}`
                : '';
            return (
              <div className='text-center'>
                <div className='font-medium'>
                  {formatNumber(v.raw_value)}
                  {uStr && (
                    <span className={`text-xs font-normal ${themeClasses.textSecondary}`}>
                      {uStr}
                    </span>
                  )}
                </div>
                <div className={`text-xs ${themeClasses.textSecondary}`} title='Chuẩn hóa'>
                  Giá trị chuẩn hóa → {v.normalized_value.toFixed(2)}
                </div>
              </div>
            );
          },
        };
      }),
    ];
    if (isSuperAdmin) {
      cols.push({
        header: 'Thao tác',
        accessor: '_actions',
        render: (_: unknown, row: WardYearIndicatorRow) => (
          <div className='flex justify-end gap-1'>
            <Button
              variant='primary'
              onClick={(e) => {
                e.stopPropagation();
                setEditingIndicatorRow(row);
                const base: Record<string, string | number> = {
                  unit_id: row.unit_id,
                  data_year: row.data_year,
                };
                indicatorCodes.forEach((code) => {
                  const cell = row[code] as IndicatorCell | undefined;
                  base[code] = cell?.raw_value ?? 0;
                });
                setIndicatorForm(base);
                setIndicatorModalOpen(true);
              }}
              className='rounded text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400'
            >
              <FaEdit size={12} />
            </Button>
            <Button
              variant='danger'
              onClick={(e) => {
                e.stopPropagation();
                setIndicatorToDelete(row);
              }}
              className='rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
            >
              <FaTrash size={12} />
            </Button>
          </div>
        ),
      });
    }
    return cols;
  }, [indicatorCodes, indicators, indicatorUnitFallback, isSuperAdmin, themeClasses.textSecondary]);

  // Mutations
  const createWardMut = useMutation({
    mutationFn: (p: AdministrativeUnitCreatePayload) => administrativeUnitService.createUnit(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['administrative-units'] });
      toast.success('Thêm phường thành công!');
      setWardModalOpen(false);
      setWardForm({ name: '', area_km2: 0, coordinates: '' });
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Lỗi khi thêm phường'
      );
    },
  });

  const updateWardMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdministrativeUnitCreatePayload }) =>
      administrativeUnitService.updateUnit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['administrative-units'] });
      toast.success('Cập nhật phường thành công!');
      setWardModalOpen(false);
      setEditingWard(null);
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Lỗi khi cập nhật'
      );
    },
  });

  const deleteWardMut = useMutation({
    mutationFn: (id: string) => administrativeUnitService.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['administrative-units'] });
      toast.success('Đã xóa phường.');
      setWardToDelete(null);
      if (wardToDelete && selectedWardId === wardToDelete._id) setSelectedWardId(null);
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Lỗi khi xóa'
      );
    },
  });

  const bulkUpsertIndicators = useMutation({
    mutationFn: (items: Parameters<typeof indicatorValueService.bulkUpsert>[0]) =>
      indicatorValueService.bulkUpsert(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicator-values'] });
      toast.success('Đã lưu chỉ số!');
      setIndicatorModalOpen(false);
      setEditingIndicatorRow(null);
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Lỗi khi lưu'
      );
    },
  });

  const deleteIndicatorsMut = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) await indicatorValueService.deleteValue(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicator-values'] });
      toast.success('Đã xóa chỉ số.');
      setIndicatorToDelete(null);
    },
  });

  const updateWeightsMut = useMutation({
    mutationFn: (items: Array<{ code: string; weight: number }>) =>
      floodIndicatorService.updateWeights(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flood-indicators'] });
      toast.success('Đã lưu trọng số AHP!');
      setAhpModalOpen(false);
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      toast.error(err?.response?.data?.error || err?.message || 'Lỗi khi lưu trọng số');
    },
  });

  const refreshAssessmentsMut = useMutation({
    mutationFn: (year?: number) => riskAssessmentService.refreshAssessments(year),
    onSuccess: (data) => {
      toast.success(data.message || 'Đã tính lại đánh giá rủi ro!');
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      toast.error(err?.response?.data?.error || err?.message || 'Lỗi khi tính đánh giá');
    },
  });

  // Handlers
  const handleWardFormSubmit = (
    data: WardFormData,
    geom: NonNullable<AdministrativeUnitCreatePayload['geom']>
  ) => {
    const payload = {
      name: data.name.trim(),
      area_km2: data.area_km2,
      geom: geom!,
    };
    if (editingWard) {
      updateWardMut.mutate({ id: editingWard._id, payload });
    } else {
      createWardMut.mutate(payload);
    }
  };

  const handleOpenWardAdd = () => {
    setEditingWard(null);
    setWardForm({ name: '', area_km2: 0, coordinates: '' });
    setWardErrors({});
    setWardModalOpen(true);
  };

  const handleOpenWardEdit = (ward: AdministrativeUnit) => {
    setEditingWard(ward);
    const c = extractCenterFromGeom(ward.geom);
    setWardForm({
      name: ward.name,
      area_km2: ward.area_km2 ?? 0,
      coordinates: c ? `${c[0]}, ${c[1]}` : '',
    });
    setWardModalOpen(true);
  };

  const handleIndicatorSubmit = () => {
    if (!indicatorForm.unit_id) {
      toast.error('Chọn phường');
      return;
    }
    if (indicatorCodes.length === 0) {
      toast.error('Chưa có chỉ số. Thêm chỉ số trong Quản lý chỉ số trước.');
      return;
    }
    const items = indicatorCodes
      .filter((c) => codeToId[c])
      .map((c) => {
        const val = indicatorForm[c];
        const raw = val === undefined || val === null || val === '' ? 0 : Number(val);
        const num = isNaN(raw) ? 0 : raw;
        return {
          unit_id: String(indicatorForm.unit_id),
          indicator_id: codeToId[c],
          data_year: Number(indicatorForm.data_year),
          raw_value: num,
        };
      });
    bulkUpsertIndicators.mutate(items);
  };

  const collectIndicatorIds = (row: WardYearIndicatorRow): string[] => {
    const ids: string[] = [];
    indicatorCodes.forEach((c) => {
      const v = row[c] as IndicatorCell | undefined;
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
        .replace(/^\uFEFF/, '')
        .trim()
        .split('\n');
      if (lines.length < 2) {
        toast.error('File không có dữ liệu');
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const unitIdx = headers.findIndex((h) => h.includes('unit') || h === 'mã phường');
      const yearIdx = headers.findIndex((h) => h.includes('year') || h.includes('năm'));
      const idxs = indicatorCodes.map((c) =>
        headers.findIndex((h) => h === c.toLowerCase() || h.includes(c.toLowerCase()))
      );
      const unitNameToId = Object.fromEntries(allUnits.map((u) => [u.name, u._id]));
      const unitIdSet = new Set(allUnits.map((u) => u._id));
      const items: Array<{
        unit_id: string;
        indicator_id: string;
        data_year: number;
        raw_value: number;
      }> = [];

      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map((v) => v.trim());
        const unitVal = unitIdx >= 0 ? vals[unitIdx] : '';
        const unitId = unitIdSet.has(unitVal) ? unitVal : unitNameToId[unitVal] || unitVal;
        const year = parseInt(yearIdx >= 0 ? vals[yearIdx] : '0') || new Date().getFullYear();
        if (!unitId || !year) continue;
        indicatorCodes.forEach((code, c) => {
          const idx = idxs[c];
          if (idx < 0 || !codeToId[code]) return;
          const raw = Math.max(0, parseFloat(vals[idx] || '0') || 0);
          items.push({
            unit_id: unitId,
            indicator_id: codeToId[code],
            data_year: year,
            raw_value: raw,
          });
        });
      }
      if (items.length === 0) {
        toast.error('Không có dữ liệu hợp lệ');
        return;
      }
      await indicatorValueService.bulkUpsert(items);
      const recordsCount = indicatorCodes.length > 0 ? items.length / indicatorCodes.length : 0;
      toast.success(`Đã import ${recordsCount} bản ghi`);
      queryClient.invalidateQueries({ queryKey: ['indicator-values'] });
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi import CSV');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleOpenAhp = () => {
    const n = indicatorsInAHOrder.length;
    const codes = indicatorsInAHOrder.map((i) => i.code);
    if (n === 5 && JSON.stringify(codes) === JSON.stringify(LEGACY_AHP_ORDER)) {
      setAhpMatrix(DEFAULT_AHP_MATRIX_5.map((r) => [...r]));
    } else {
      setAhpMatrix(n > 0 ? createEmptyAHPMatrix(n) : []);
    }
    setAhpResult(null);
    setAhpModalOpen(true);
  };

  const handleOpenIndicatorAdd = () => {
    setEditingIndicatorRow(null);
    const base: Record<string, string | number> = {
      unit_id: selectedWardId ?? allUnits[0]?._id ?? '',
      data_year: new Date().getFullYear(),
    };
    indicatorCodes.forEach((c) => {
      base[c] = 0;
    });
    setIndicatorForm(base);
    setIndicatorModalOpen(true);
  };

  const selectedWardName = selectedWardId ? unitIdToName[selectedWardId] ?? 'Phường' : null;

  return (
    <div
      className={`min-h-full ${themeClasses.background}`}
      style={{ fontFamily: 'system-ui, sans-serif' }}
    >
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-2'>
          <div
            className={`p-2 rounded-xl ${theme === 'light' ? 'bg-indigo-100' : 'bg-indigo-900/30'}`}
          >
            <FaMapMarkedAlt
              className={theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}
              size={28}
            />
          </div>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.text}`}>
              Quản lý Phường & Chỉ số Rủi ro
            </h1>
            <p className={`text-sm mt-1 ${themeClasses.textSecondary}`}>
              Quản lý danh sách phường và chỉ số rủi ro theo phường và năm (chỉ số lấy từ
              flood_indicators)
            </p>
          </div>
        </div>
      </div>

      <div className='px-2 space-y-6'>
        <WardListPanel
          wards={wards}
          loading={loadingWards}
          selectedWardId={selectedWardId}
          pagination={wardPagination}
          paginationData={wardPaginationData}
          isSuperAdmin={isSuperAdmin}
          onSelectWard={setSelectedWardId}
          onRefresh={refetchWards}
          onAdd={handleOpenWardAdd}
          onEdit={handleOpenWardEdit}
          onDelete={setWardToDelete}
          onPageChange={(page) => setWardPagination((p) => ({ ...p, page }))}
        />

        <IndicatorTablePanel
          selectedWardId={selectedWardId}
          selectedWardName={selectedWardName}
          allUnits={allUnits}
          yearFilter={yearFilter}
          pageData={indicatorPageData}
          columns={indicatorTableColumns}
          loading={loadingIndicators}
          totalRows={groupedIndicatorRows.length}
          pagination={indicatorPagination}
          totalPages={indicatorPages}
          isSuperAdmin={isSuperAdmin}
          isUploading={isUploading}
          isRefreshing={refreshAssessmentsMut.isPending}
          onWardChange={setSelectedWardId}
          onYearChange={setYearFilter}
          onRefresh={refetchIndicators}
          onPageChange={(page) => setIndicatorPagination((p) => ({ ...p, page }))}
          onAdd={handleOpenIndicatorAdd}
          onAhpOpen={handleOpenAhp}
          onRefreshAssessments={() =>
            refreshAssessmentsMut.mutate(yearFilter ? Number(yearFilter) : undefined)
          }
          onCsvUpload={handleCsvUpload}
        />
      </div>

      <WardFormModal
        isOpen={wardModalOpen}
        editingWard={editingWard}
        form={wardForm}
        errors={wardErrors}
        loading={createWardMut.isPending || updateWardMut.isPending}
        onClose={() => {
          setWardModalOpen(false);
          setEditingWard(null);
          setWardForm({ name: '', area_km2: 0, coordinates: '' });
        }}
        onChange={setWardForm}
        onErrorsChange={setWardErrors}
        onSubmit={(data, geom) => {
          if (geom) handleWardFormSubmit(data, geom);
        }}
      />

      <WardDeleteModal
        ward={wardToDelete}
        loading={deleteWardMut.isPending}
        onClose={() => setWardToDelete(null)}
        onConfirm={() => wardToDelete && deleteWardMut.mutate(wardToDelete._id)}
      />

      <WardIndicatorFormModal
        isOpen={indicatorModalOpen}
        isEdit={!!editingIndicatorRow}
        form={indicatorForm}
        indicators={indicators}
        indicatorCodes={indicatorCodes}
        allUnits={allUnits}
        unitFallback={indicatorUnitFallback}
        loading={bulkUpsertIndicators.isPending}
        onClose={() => {
          setIndicatorModalOpen(false);
          setEditingIndicatorRow(null);
        }}
        onChange={setIndicatorForm}
        onSubmit={handleIndicatorSubmit}
      />

      <WardIndicatorDeleteModal
        row={indicatorToDelete}
        indicatorCount={indicatorCodes.length}
        loading={deleteIndicatorsMut.isPending}
        onClose={() => setIndicatorToDelete(null)}
        onConfirm={() =>
          indicatorToDelete && deleteIndicatorsMut.mutate(collectIndicatorIds(indicatorToDelete))
        }
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
    </div>
  );
}
