import { api } from "../plugins/axios";
import type {
  ReportDashboardData,
  ReportCompareData,
} from "../types/report";

export type { ReportDashboardData, ReportCompareData } from "../types/report";

export const reportService = {
  async getDashboard(year?: number) {
    const yr = year ?? new Date().getFullYear();
    const res = await api.get<{ success: boolean; data: ReportDashboardData }>(
      `/reports/dashboard?year=${yr}`
    );
    return res.data.data;
  },

  async getCompare(year1?: number, year2?: number) {
    const y1 = year1 ?? new Date().getFullYear();
    const y2 = year2 ?? y1 - 1;
    const res = await api.get<{ success: boolean; data: ReportCompareData }>(
      `/reports/compare?year1=${y1}&year2=${y2}`
    );
    return res.data.data;
  },

  async downloadExcel(year?: number) {
    const yr = year ?? new Date().getFullYear();
    const res = await api.get(`/reports/export/excel?year=${yr}`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bao_cao_rui_ro_${yr}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async downloadPDF(year?: number) {
    const yr = year ?? new Date().getFullYear();
    const res = await api.get(`/reports/export/pdf?year=${yr}`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bao_cao_rui_ro_${yr}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
