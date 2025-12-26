import { useState } from "react";
import { FaUpload, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";
import { Table, Input, Modal, Button } from "../../../components";

import type { WeatherData } from "../../../types/dataManagement";

interface WeatherDataProps {
  id: string;
  ward_id: string;
  date: string;
  rainfall: number;
  water_level: number;
  tidal_level: number;
}

const WeatherDataManagement = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<WeatherData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  const [formData, setFormData] = useState<WeatherData>({
    id: "",
    ward_id: "",
    date: "",
    rainfall: 0,
    water_level: 0,
    tidal_level: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingData) {
      setWeatherData(
        weatherData.map((w) => (w.id === editingData.id ? formData : w)),
      );
    } else {
      setWeatherData([
        ...weatherData,
        { ...formData, id: Date.now().toString() },
      ]);
    }
    setIsUploadModalOpen(false);
    setIsEditModalOpen(false);
    setEditingData(null);
    setFormData({
      id: "",
      ward_id: "",
      date: "",
      rainfall: 0,
      water_level: 0,
      tidal_level: 0,
    });
  };

  const handleEdit = (data: WeatherData) => {
    setEditingData(data);
    setFormData(data);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa dữ liệu này?")) {
      setWeatherData(weatherData.filter((w) => w.id !== id));
    }
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
          Quản lý Dữ liệu Thời tiết
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
          { header: "Ngày", accessor: "date" },
          { header: "Lượng mưa (mm)", accessor: "rainfall" },
          { header: "Mực nước (m)", accessor: "water_level" },
          { header: "Mực triều (m)", accessor: "tidal_level" },
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
        data={weatherData}
        emptyMessage="Chưa có dữ liệu. Hãy thêm dữ liệu thời tiết mới."
      />

      <Modal
        isOpen={isUploadModalOpen || isEditModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setIsEditModalOpen(false);
          setEditingData(null);
        }}
        title={editingData ? "Chỉnh sửa Dữ liệu Thời tiết" : "Thêm Dữ liệu Thời tiết"}
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
          <Input
            label="Ngày *"
            type="date"
            required
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Lượng mưa (mm) *"
              type="number"
              required
              step="0.1"
              value={formData.rainfall}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rainfall: parseFloat(e.target.value),
                })
              }
            />
            <Input
              label="Mực nước (m) *"
              type="number"
              required
              step="0.01"
              value={formData.water_level}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  water_level: parseFloat(e.target.value),
                })
              }
            />
            <Input
              label="Mực triều (m) *"
              type="number"
              required
              step="0.01"
              value={formData.tidal_level}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tidal_level: parseFloat(e.target.value),
                })
              }
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WeatherDataManagement;

