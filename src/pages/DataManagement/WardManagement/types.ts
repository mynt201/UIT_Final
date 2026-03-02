/** Giá trị 1 chỉ số trong 1 dòng phường-năm */
export interface IndicatorCell {
  _id: string;
  raw_value: number;
  normalized_value: number;
}

export interface WardYearIndicatorRow {
  unit_id: string;
  unit_name: string;
  data_year: number;
  /** Chỉ số động: code -> { _id, raw_value, normalized_value } */
  [code: string]: string | number | IndicatorCell | undefined;
}
