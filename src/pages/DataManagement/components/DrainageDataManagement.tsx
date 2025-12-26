import { useState } from "react";
import { FaUpload, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";
import { Table, Input, Select, Modal, Button } from "../../../components";
import type { DrainageData } from "../../../types/dataManagement";

const DrainageDataManagement = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<DrainageData | null>(null);
  const [drainageData, setDrainageData] = useState<DrainageData[]>([]);

  const [formData, setFormData] = useState<DrainageData>({
    id: "",
    ward_id: "",
    name: "",
    type: "",
    condition: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingData) {
      setDrainageData(
        drainageData.map((d) => (d.id === editingData.id ? formData : d)),
      );
    } else {
      setDrainageData([
        ...drainageData,
        { ...formData, id: Date.now().toString() },
      ]);
    }
    setIsUploadModalOpen(false);
    setIsEditModalOpen(false);
    setEditingData(null);
    setFormData({
      id: "",
      ward_id: "",
      name: "",
      type: "",
      condition: "",
    });
  };

  const handleEdit = (data: DrainageData) => {
    setEditingData(data);
    setFormData(data);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa dữ liệu này?")) {
      setDrainageData(drainageData.filter((d) => d.id !== id));
    }
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
          Quản lý Hệ thống Thoát nước
        </h2>
        <div className="flex gap-3">
          <label
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg cursor-pointer transition-colors ${
              theme === "light"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-indigo-500 hover:bg-indigo-600"
            }`}
          >
            <FaUpload />
            <span>Upload File</span>
            <input type="file" accept=".csv,.json" className="hidden" />
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
          { header: "Tên hệ thống", accessor: "name" },
          { header: "Loại", accessor: "type" },
          { header: "Tình trạng", accessor: "condition" },
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
        data={drainageData}
        emptyMessage="Chưa có dữ liệu. Hãy thêm hệ thống thoát nước mới."
      />

      <Modal
        isOpen={isUploadModalOpen || isEditModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setIsEditModalOpen(false);
          setEditingData(null);
        }}
        title={
          editingData
            ? "Chỉnh sửa Hệ thống Thoát nước"
            : "Thêm Hệ thống Thoát nước"
        }
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
            label="Tên hệ thống *"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Loại *"
              required
              options={[
                { value: "Cống", label: "Cống" },
                { value: "Kênh", label: "Kênh" },
                { value: "Hồ điều hòa", label: "Hồ điều hòa" },
                { value: "Trạm bơm", label: "Trạm bơm" },
              ]}
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              placeholder="Chọn loại"
            />
            <Select
              label="Tình trạng *"
              required
              options={[
                { value: "Tốt", label: "Tốt" },
                { value: "Khá", label: "Khá" },
                { value: "Trung bình", label: "Trung bình" },
                { value: "Kém", label: "Kém" },
              ]}
              value={formData.condition}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value })
              }
              placeholder="Chọn tình trạng"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DrainageDataManagement;
