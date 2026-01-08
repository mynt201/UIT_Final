import type { WardData } from "../types";

export const mockWards: WardData[] = [
  // Khu vực có rủi ro Cao (màu đỏ/cam) - Quận 1, Quận 3 (trung tâm)
  {
    ward_name: 'Phường Bến Nghé',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.695, 10.775],
          [106.705, 10.775],
          [106.705, 10.785],
          [106.695, 10.785],
          [106.695, 10.775],
        ],
      ],
    },
    population_density: 9500,
    rainfall: 260,
    low_elevation: 5.5,
    urban_land: 6.5,
    drainage_capacity: 2,
  },
  {
    ward_name: 'Phường Đa Kao',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.695, 10.785],
          [106.705, 10.785],
          [106.702, 10.792],
          [106.692, 10.792],
          [106.695, 10.785],
        ],
      ],
    },
    population_density: 9200,
    rainfall: 255,
    low_elevation: 5.2,
    urban_land: 6.8,
    drainage_capacity: 2.2,
  },
  {
    ward_name: 'Phường Cô Giang',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.692, 10.792],
          [106.702, 10.792],
          [106.700, 10.800],
          [106.690, 10.800],
          [106.692, 10.792],
        ],
      ],
    },
    population_density: 8800,
    rainfall: 250,
    low_elevation: 5.0,
    urban_land: 6.2,
    drainage_capacity: 2.5,
  },
  {
    ward_name: 'Phường Nguyễn Thái Bình',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.700, 10.800],
          [106.710, 10.800],
          [106.710, 10.808],
          [106.700, 10.808],
          [106.700, 10.800],
        ],
      ],
    },
    population_density: 9100,
    rainfall: 258,
    low_elevation: 5.3,
    urban_land: 6.6,
    drainage_capacity: 2.1,
  },
  {
    ward_name: 'Phường Đa Kao 2',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.690, 10.800],
          [106.700, 10.800],
          [106.698, 10.807],
          [106.688, 10.807],
          [106.690, 10.800],
        ],
      ],
    },
    population_density: 8700,
    rainfall: 252,
    low_elevation: 4.9,
    urban_land: 6.0,
    drainage_capacity: 2.6,
  },
  // Khu vực có rủi ro Trung Bình (màu vàng) - Quận 7, Quận 2
  {
    ward_name: 'Phường Tân Phú',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.720, 10.750],
          [106.730, 10.750],
          [106.730, 10.760],
          [106.720, 10.760],
          [106.720, 10.750],
        ],
      ],
    },
    population_density: 6500,
    rainfall: 220,
    low_elevation: 3.8,
    urban_land: 4.5,
    drainage_capacity: 3.5,
  },
  {
    ward_name: 'Phường Tân Thuận Đông',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.730, 10.760],
          [106.740, 10.760],
          [106.740, 10.770],
          [106.730, 10.770],
          [106.730, 10.760],
        ],
      ],
    },
    population_density: 6200,
    rainfall: 215,
    low_elevation: 3.5,
    urban_land: 4.2,
    drainage_capacity: 3.8,
  },
  {
    ward_name: 'Phường Tân Thuận Tây',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.720, 10.760],
          [106.730, 10.760],
          [106.728, 10.768],
          [106.718, 10.768],
          [106.720, 10.760],
        ],
      ],
    },
    population_density: 6000,
    rainfall: 210,
    low_elevation: 3.3,
    urban_land: 4.0,
    drainage_capacity: 4.0,
  },
  {
    ward_name: 'Phường An Phú',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.740, 10.770],
          [106.750, 10.770],
          [106.750, 10.780],
          [106.740, 10.780],
          [106.740, 10.770],
        ],
      ],
    },
    population_density: 5800,
    rainfall: 205,
    low_elevation: 3.0,
    urban_land: 3.8,
    drainage_capacity: 4.2,
  },
  {
    ward_name: 'Phường Bình An',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.750, 10.780],
          [106.760, 10.780],
          [106.760, 10.790],
          [106.750, 10.790],
          [106.750, 10.780],
        ],
      ],
    },
    population_density: 5500,
    rainfall: 200,
    low_elevation: 2.8,
    urban_land: 3.5,
    drainage_capacity: 4.5,
  },
  // Khu vực có rủi ro Thấp (màu xanh lá) - Quận 9, Quận Thủ Đức
  {
    ward_name: 'Phường Hiệp Phú',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.760, 10.790],
          [106.770, 10.790],
          [106.770, 10.800],
          [106.760, 10.800],
          [106.760, 10.790],
        ],
      ],
    },
    population_density: 4500,
    rainfall: 180,
    low_elevation: 2.2,
    urban_land: 2.8,
    drainage_capacity: 5.5,
  },
  {
    ward_name: 'Phường Tăng Nhơn Phú A',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.770, 10.800],
          [106.780, 10.800],
          [106.780, 10.810],
          [106.770, 10.810],
          [106.770, 10.800],
        ],
      ],
    },
    population_density: 4200,
    rainfall: 175,
    low_elevation: 2.0,
    urban_land: 2.5,
    drainage_capacity: 6.0,
  },
  {
    ward_name: 'Phường Tăng Nhơn Phú B',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.760, 10.800],
          [106.770, 10.800],
          [106.768, 10.808],
          [106.758, 10.808],
          [106.760, 10.800],
        ],
      ],
    },
    population_density: 4000,
    rainfall: 170,
    low_elevation: 1.8,
    urban_land: 2.2,
    drainage_capacity: 6.5,
  },
  {
    ward_name: 'Phường Long Bình',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.780, 10.810],
          [106.790, 10.810],
          [106.790, 10.820],
          [106.780, 10.820],
          [106.780, 10.810],
        ],
      ],
    },
    population_density: 3800,
    rainfall: 165,
    low_elevation: 1.5,
    urban_land: 2.0,
    drainage_capacity: 7.0,
  },
  {
    ward_name: 'Phường Long Thạnh Mỹ',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.790, 10.820],
          [106.800, 10.820],
          [106.800, 10.830],
          [106.790, 10.830],
          [106.790, 10.820],
        ],
      ],
    },
    population_density: 3500,
    rainfall: 160,
    low_elevation: 1.2,
    urban_land: 1.8,
    drainage_capacity: 7.5,
  },
];


