import { mockWards } from '../../../mockData';
import {
  calcFloodRiskIndex,
  getRiskLevel,
  getRiskLevelLabel,
} from './floodRiskUtils';
import { Modal, Table, Button } from '../../../components';

interface RiskReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RiskReportModal({ isOpen, onClose }: RiskReportModalProps) {
  const wardStats = mockWards.map((ward) => {
    const exposure = ward.population_density / 1000 + ward.rainfall / 200;
    const susceptibility = ward.low_elevation + ward.urban_land;
    const resilience = ward.drainage_capacity || 1;
    const floodRisk = calcFloodRiskIndex(exposure, susceptibility, resilience);
    const riskLevel = getRiskLevel(floodRisk);
    const levelLabel = getRiskLevelLabel(riskLevel);

    return {
      ward_name: ward.ward_name,
      flood_risk: floodRisk,
      risk_level: levelLabel,
    };
  });

  const sortedWardStats = wardStats.sort((a, b) => b.flood_risk - a.flood_risk);
  const highRisk = wardStats.filter((w) => w.risk_level === 'Cao').length;
  const mediumRisk = wardStats.filter((w) => w.risk_level === 'Trung Bình').length;
  const lowRisk = wardStats.filter((w) => w.risk_level === 'Thấp').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Báo cáo rủi ro ngập lụt"
      maxWidth="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            In báo cáo
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
            <div className="text-red-400 text-sm mb-1">Rủi ro cao</div>
            <div className="text-3xl font-bold text-red-400">{highRisk}</div>
          </div>
          <div className="bg-orange-300/20 border border-orange-300 rounded-lg p-4">
            <div className="text-orange-300 text-sm mb-1">Rủi ro trung bình</div>
            <div className="text-3xl font-bold text-orange-300">{mediumRisk}</div>
          </div>
          <div className="bg-green-300/20 border border-green-300 rounded-lg p-4">
            <div className="text-green-300 text-sm mb-1">Rủi ro thấp</div>
            <div className="text-3xl font-bold text-green-300">{lowRisk}</div>
          </div>
        </div>

        <Table
          columns={[
            { header: "Tên phường/xã", accessor: "ward_name" },
            {
              header: "Chỉ số rủi ro",
              accessor: "flood_risk",
              render: (value) => (value as number).toFixed(2),
            },
            {
              header: "Mức độ",
              accessor: "risk_level",
              render: (value) => (
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    value === "Cao"
                      ? "bg-red-500/20 text-red-400"
                      : value === "Trung Bình"
                      ? "bg-orange-300/20 text-orange-300"
                      : "bg-green-300/20 text-green-300"
                  }`}
                >
                  {value as string}
                </span>
              ),
            },
          ]}
          data={sortedWardStats}
        />
      </div>
    </Modal>
  );
}











