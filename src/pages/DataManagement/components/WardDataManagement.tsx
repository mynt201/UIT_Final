import { useState } from "react";
import { FaUpload, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";
import { Table, Input, Textarea, Modal, Button } from "../../../components";

interface WardData {
  ward_id: string;
  name: string;
  area: number;
  population: number;
  coordinates: string;
}

const WardDataManagement = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<WardData | null>(null);
  const [wards, setWards] = useState<WardManagementData[]>([]);

  const [formData, setFormData] = useState<WardData>({
    ward_id: "",
    name: "",
    area: 0,
    population: 0,
    coordinates: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWard) {
      // Update existing ward
      setWards(
        wards.map((w) => (w.ward_id === editingWard.ward_id ? formData : w)),
      );
    } else {
      // Add new ward
      setWards([...wards, { ...formData, ward_id: Date.now().toString() }]);
    }
    setIsUploadModalOpen(false);
    setIsEditModalOpen(false);
    setEditingWard(null);
    setFormData({
      ward_id: "",
      name: "",
      area: 0,
      population: 0,
      coordinates: "",
    });
  };

  const handleEdit = (ward: WardData) => {
    setEditingWard(ward);
    setFormData(ward);
    setIsEditModalOpen(true);
  };

  const handleDelete = (wardId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa phường/xã này?")) {
      setWards(wards.filter((w) => w.ward_id !== wardId));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement CSV/JSON file parsing
      alert("Chức năng upload file sẽ được triển khai");
    }
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
          Quản lý Dữ liệu Phường/Xã
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
              onChange={handleFileUpload}
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

      {/* Data Table */}
      <Table
        columns={[
          { header: "ID", accessor: "ward_id" },
          { header: "Tên phường/xã", accessor: "name" },
          {
            header: "Diện tích (km²)",
            accessor: "area",
            render: (value) => value.toLocaleString(),
          },
          {
            header: "Dân số",
            accessor: "population",
            render: (value) => value.toLocaleString(),
          },
          {
            header: "Tọa độ",
            accessor: "coordinates",
            render: (value) => (
              <span className="text-sm">{value}</span>
            ),
          },
          {
            header: "Thao tác",
            accessor: "ward_id",
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
                  onClick={() => handleDelete(row.ward_id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            ),
          },
        ]}
        data={wards}
        emptyMessage="Chưa có dữ liệu. Hãy thêm phường/xã mới."
      />

      {/* Upload/Edit Modal */}
      <Modal
        isOpen={isUploadModalOpen || isEditModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setIsEditModalOpen(false);
          setEditingWard(null);
          setFormData({
            ward_id: "",
            name: "",
            area: 0,
            population: 0,
            coordinates: "",
          });
        }}
        title={editingWard ? "Chỉnh sửa Phường/Xã" : "Thêm Phường/Xã mới"}
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setIsUploadModalOpen(false);
                setIsEditModalOpen(false);
                setEditingWard(null);
                setFormData({
                  ward_id: "",
                  name: "",
                  area: 0,
                  population: 0,
                  coordinates: "",
                });
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
              {editingWard ? "Cập nhật" : "Thêm mới"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên phường/xã *"
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Diện tích (km²) *"
              type="number"
              required
              step="0.01"
              value={formData.area}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  area: parseFloat(e.target.value),
                })
              }
            />
            <Input
              label="Dân số *"
              type="number"
              required
              value={formData.population}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  population: parseInt(e.target.value),
                })
              }
            />
          </div>
          <Textarea
            label="Tọa độ (JSON hoặc WKT) *"
            required
            value={formData.coordinates}
            onChange={(e) =>
              setFormData({ ...formData, coordinates: e.target.value })
            }
            rows={3}
            placeholder='{"type": "Polygon", "coordinates": [...]}'
            className="font-mono text-sm"
          />
        </form>
      </Modal>
    </div>
  );
};

export default WardDataManagement;

