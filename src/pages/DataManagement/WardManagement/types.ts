export interface IndicatorCell {
  _id: string;
  raw_value: number;
  normalized_value: number;
}

export interface WardYearIndicatorRow {
  unit_id: string;
  unit_name: string;
  data_year: number;
  [code: string]: string | number | IndicatorCell | undefined;
}
