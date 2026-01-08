import { useState } from "react";
import { FaUpload, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";
import { Table, Input, Modal, Button } from "../../../components";
import type { RiskIndexData } from "../../../types/dataManagement";

const RiskIndexManagement = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<RiskIndexData | null>(null);
  const [riskIndexData, setRiskIndexData] = useState<RiskIndexData[]>([]);

  const [formData, setFormData] = useState<RiskIndexData>({
    id: "",
    ward_id: "",
    date: new Date().toISOString().split('T')[0],
    risk_index: 0,
    exposure: 0,
    susceptibility: 0,
    resilience: 0,
  });

  const calculateScore = (exposure: number, susceptibility: number, resilience: number) => {
    return (exposure + susceptibility) / (resilience || 1);
  };

  const handleExposureChange = (value: number) => {
    const newExposure = value;
    const newScore = calculateScore(newExposure, formData.susceptibility, formData.resilience);
    setFormData({
      ...formData,
      exposure: newExposure,
      risk_index: newScore,
    });
  };

  const handleSusceptibilityChange = (value: number) => {
    const newSusceptibility = value;
    const newScore = calculateScore(formData.exposure, newSusceptibility, formData.resilience);
    setFormData({
      ...formData,
      susceptibility: newSusceptibility,
      risk_index: newScore,
    });
  };

  const handleResilienceChange = (value: number) => {
    const newResilience = value;
    const newScore = calculateScore(formData.exposure, formData.susceptibility, newResilience);
    setFormData({
      ...formData,
      resilience: newResilience,
      risk_index: newScore,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingData) {
      setRiskIndexData(
        riskIndexData.map((r) => (r.id === editingData.id ? formData : r)),
      );
    } else {
      setRiskIndexData([
        ...riskIndexData,
        { ...formData, id: Date.now().toString() },
      ]);
    }
    setIsUploadModalOpen(false);
    setIsEditModalOpen(false);
    setEditingData(null);
    setFormData({
      id: "",
      ward_id: "",
      date: new Date().toISOString().split('T')[0],
      exposure: 0,
      susceptibility: 0,
      resilience: 0,
      risk_index: 0,
    });
  };

  const handleEdit = (data: RiskIndexData) => {
    setEditingData(data);
    setFormData(data);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa chỉ số rủi ro này?")) {
      setRiskIndexData(riskIndexData.filter((r) => r.id !== id));
    }
  };

  const getRiskLevel = (riskIndex: number): string => {
    if (riskIndex >= 6) return "Cao";
    if (riskIndex >= 4) return "Trung Bình";
    return "Thấp";
  };

  const getRiskColor = (riskIndex: number): string => {
    if (riskIndex >= 6) return "text-red-400";
    if (riskIndex >= 4) return "text-orange-400";
    return "text-green-400";
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
          Quản lý Chỉ số Rủi ro
        </h2>
        <div className="flex gap-3">
          <label className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg cursor-pointer transition-colors ${
            theme === 'light' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'
          }`}>
            <FaUpload />
            <span>Upload File</span>
            <input
              type="file"
              accept=".csv,.json"
              className="hidden"
            />
          </label>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <FaPlus />
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      <Table
        columns={[
          { header: "ID Phường", accessor: "ward_id" },
          {
            header: "Exposure",
            accessor: "exposure",
            render: (value) => (value as number).toFixed(2),
          },
          {
            header: "Susceptibility",
            accessor: "susceptibility",
            render: (value) => (value as number).toFixed(2),
          },
          {
            header: "Resilience",
            accessor: "resilience",
            render: (value) => (value as number).toFixed(2),
          },
          {
            header: "Chỉ số Rủi ro",
            accessor: "risk_index",
            render: (value) => (
              <span className={`font-bold ${getRiskColor(value as number)}`}>
                {(value as number).toFixed(2)}
              </span>
            ),
          },
          {
            header: "Mức độ",
            accessor: "risk_index",
            render: (value) => (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  getRiskLevel(value as number) === "Cao"
                    ? "bg-red-500/20 text-red-400"
                    : getRiskLevel(value as number) === "Trung Bình"
                    ? "bg-orange-300/20 text-orange-300"
                    : "bg-green-300/20 text-green-300"
                }`}
              >
                {getRiskLevel(value as number)}
              </span>
            ),
          },
          {
            header: "Thao tác",
            accessor: "id",
            render: (_, row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(row)}
                  className={`p-2 rounded transition-colors ${
                    theme === "light"
                      ? "text-indigo-600 hover:bg-indigo-500/20"
                      : "text-indigo-400 hover:bg-indigo-500/20"
                  }`}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            ),
          },
        ]}
        data={riskIndexData}
        emptyMessage="Chưa có dữ liệu. Hãy thêm chỉ số rủi ro mới."
      />

      <Modal
        isOpen={isUploadModalOpen || isEditModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setIsEditModalOpen(false);
          setEditingData(null);
        }}
        title={editingData ? "Chỉnh sửa Chỉ số Rủi ro" : "Thêm Chỉ số Rủi ro mới"}
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setIsUploadModalOpen(false);
                setIsEditModalOpen(false);
                setEditingData(null);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any);
              }}
            >
              {editingData ? "Cập nhật" : "Thêm mới"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ID Phường/Xã *"
            type="text"
            required
            value={formData.ward_id}
            onChange={(e) =>
              setFormData({ ...formData, ward_id: e.target.value })
            }
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Exposure *"
              type="number"
              required
              step="0.01"
              value={formData.exposure}
              onChange={(e) =>
                handleExposureChange(parseFloat(e.target.value))
              }
            />
            <Input
              label="Susceptibility *"
              type="number"
              required
              step="0.01"
              value={formData.susceptibility}
              onChange={(e) =>
                handleSusceptibilityChange(parseFloat(e.target.value))
              }
            />
            <Input
              label="Resilience *"
              type="number"
              required
              step="0.01"
              min="0.1"
              value={formData.resilience}
              onChange={(e) =>
                handleResilienceChange(parseFloat(e.target.value))
              }
            />
          </div>
          <div className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700/50'} rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <span className={`${themeClasses.text} font-medium`}>Chỉ số Rủi ro (tự động tính):</span>
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-bold ${getRiskColor(formData.risk_index)}`}>
                  {formData.risk_index.toFixed(2)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    getRiskLevel(formData.risk_index) === "Cao"
                      ? "bg-red-500/20 text-red-400"
                      : getRiskLevel(formData.risk_index) === "Trung Bình"
                      ? "bg-orange-300/20 text-orange-300"
                      : "bg-green-300/20 text-green-300"
                  }`}
                >
                  {getRiskLevel(formData.risk_index)}
                </span>
              </div>
            </div>
            <p className={`text-xs ${themeClasses.textSecondary} mt-2`}>
              Công thức: (Exposure + Susceptibility) / Resilience
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RiskIndexManagement;

