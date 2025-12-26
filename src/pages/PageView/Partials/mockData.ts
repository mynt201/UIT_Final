// Dữ liệu phường giả lập - tọa độ tương đối của TP.HCM
// TP.HCM: Kinh độ ~106.6-106.8, Vĩ độ ~10.7-10.9

export interface WardData {
  ward_name: string;
  geometry: {
    type: string;
    rings: number[][][];
  };
  population_density: number;
  rainfall: number;
  low_elevation: number;
  urban_land: number;
  drainage_capacity: number;
}

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
    population_density: 8800,
    rainfall: 240,
    low_elevation: 4.8,
    urban_land: 5.8,
    drainage_capacity: 2.5,
  },
  {
    ward_name: 'Phường Cô Giang',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.685, 10.768],
          [106.695, 10.768],
          [106.695, 10.778],
          [106.688, 10.778],
          [106.685, 10.775],
          [106.685, 10.768],
        ],
      ],
    },
    population_density: 9200,
    rainfall: 250,
    low_elevation: 5.2,
    urban_land: 6.2,
    drainage_capacity: 2.2,
  },
  {
    ward_name: 'Phường Nguyễn Thái Bình',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.705, 10.768],
          [106.715, 10.768],
          [106.715, 10.778],
          [106.705, 10.778],
          [106.705, 10.768],
        ],
      ],
    },
    population_density: 10000,
    rainfall: 280,
    low_elevation: 6,
    urban_land: 7,
    drainage_capacity: 1.8,
  },
  {
    ward_name: 'Phường Phạm Ngũ Lão',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.695, 10.758],
          [106.703, 10.758],
          [106.703, 10.768],
          [106.695, 10.768],
          [106.695, 10.758],
        ],
      ],
    },
    population_density: 8700,
    rainfall: 230,
    low_elevation: 4.5,
    urban_land: 5.5,
    drainage_capacity: 2.8,
  },
  // Khu vực có rủi ro Trung bình (màu xanh lá nhạt) - Quận 2, Quận 7
  {
    ward_name: 'Phường An Phú',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.745, 10.795],
          [106.755, 10.795],
          [106.755, 10.805],
          [106.745, 10.805],
          [106.745, 10.795],
        ],
      ],
    },
    population_density: 6200,
    rainfall: 155,
    low_elevation: 3.2,
    urban_land: 4.2,
    drainage_capacity: 4.2,
  },
  {
    ward_name: 'Phường Thảo Điền',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.735, 10.788],
          [106.745, 10.788],
          [106.745, 10.798],
          [106.738, 10.798],
          [106.735, 10.795],
          [106.735, 10.788],
        ],
      ],
    },
    population_density: 5800,
    rainfall: 148,
    low_elevation: 3,
    urban_land: 4,
    drainage_capacity: 4.5,
  },
  {
    ward_name: 'Phường Tân Phong',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.715, 10.748],
          [106.725, 10.748],
          [106.725, 10.758],
          [106.715, 10.758],
          [106.715, 10.748],
        ],
      ],
    },
    population_density: 5600,
    rainfall: 145,
    low_elevation: 2.8,
    urban_land: 3.8,
    drainage_capacity: 4.8,
  },
  {
    ward_name: 'Phường Tân Thuận Đông',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.725, 10.738],
          [106.735, 10.738],
          [106.735, 10.748],
          [106.725, 10.748],
          [106.725, 10.738],
        ],
      ],
    },
    population_density: 5400,
    rainfall: 142,
    low_elevation: 2.6,
    urban_land: 3.6,
    drainage_capacity: 5,
  },
  {
    ward_name: 'Phường Bình Khánh',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.735, 10.728],
          [106.745, 10.728],
          [106.745, 10.738],
          [106.735, 10.738],
          [106.735, 10.728],
        ],
      ],
    },
    population_density: 5200,
    rainfall: 138,
    low_elevation: 2.5,
    urban_land: 3.5,
    drainage_capacity: 5.2,
  },
  {
    ward_name: 'Phường Tân Kiểng',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.705, 10.748],
          [106.715, 10.748],
          [106.715, 10.758],
          [106.708, 10.758],
          [106.705, 10.755],
          [106.705, 10.748],
        ],
      ],
    },
    population_density: 6000,
    rainfall: 158,
    low_elevation: 3.3,
    urban_land: 4.3,
    drainage_capacity: 4.3,
  },
  // Khu vực có rủi ro Thấp (màu hồng nhạt/peach) - Quận 9, Quận Thủ Đức
  {
    ward_name: 'Phường Long Bình',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.785, 10.845],
          [106.795, 10.845],
          [106.795, 10.855],
          [106.785, 10.855],
          [106.785, 10.845],
        ],
      ],
    },
    population_density: 3200,
    rainfall: 95,
    low_elevation: 1.2,
    urban_land: 2.2,
    drainage_capacity: 6.8,
  },
  {
    ward_name: 'Phường Long Thạnh Mỹ',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.775, 10.835],
          [106.785, 10.835],
          [106.785, 10.845],
          [106.778, 10.845],
          [106.775, 10.842],
          [106.775, 10.835],
        ],
      ],
    },
    population_density: 3000,
    rainfall: 92,
    low_elevation: 1,
    urban_land: 2,
    drainage_capacity: 7,
  },
  {
    ward_name: 'Phường Tăng Nhơn Phú A',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.765, 10.845],
          [106.775, 10.845],
          [106.775, 10.855],
          [106.765, 10.855],
          [106.765, 10.845],
        ],
      ],
    },
    population_density: 3100,
    rainfall: 93,
    low_elevation: 1.1,
    urban_land: 2.1,
    drainage_capacity: 6.9,
  },
  {
    ward_name: 'Phường Tân Phú',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.625, 10.768],
          [106.635, 10.768],
          [106.635, 10.778],
          [106.625, 10.778],
          [106.625, 10.768],
        ],
      ],
    },
    population_density: 2900,
    rainfall: 88,
    low_elevation: 0.9,
    urban_land: 1.9,
    drainage_capacity: 7.2,
  },
  {
    ward_name: 'Phường Sơn Kỳ',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.615, 10.758],
          [106.625, 10.758],
          [106.625, 10.768],
          [106.618, 10.768],
          [106.615, 10.765],
          [106.615, 10.758],
        ],
      ],
    },
    population_density: 2800,
    rainfall: 86,
    low_elevation: 0.8,
    urban_land: 1.8,
    drainage_capacity: 7.5,
  },
  {
    ward_name: 'Phường Tân Sơn Nhì',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.605, 10.748],
          [106.615, 10.748],
          [106.615, 10.758],
          [106.605, 10.758],
          [106.605, 10.748],
        ],
      ],
    },
    population_density: 2700,
    rainfall: 84,
    low_elevation: 0.7,
    urban_land: 1.7,
    drainage_capacity: 7.8,
  },
];
