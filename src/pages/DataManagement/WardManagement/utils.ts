import type { AdministrativeUnitGeom } from '../../../services/administrativeUnitService';

export function createPolygonFromCenter(
  lat: number,
  lng: number
): AdministrativeUnitGeom {
  const delta = 0.002;
  return {
    type: 'Polygon',
    coordinates: [
      [
        [lng - delta, lat - delta],
        [lng + delta, lat - delta],
        [lng + delta, lat + delta],
        [lng - delta, lat + delta],
        [lng - delta, lat - delta],
      ],
    ],
  };
}

export function extractCenterFromGeom(
  geom: AdministrativeUnitGeom | null
): [number, number] | null {
  if (!geom?.coordinates) return null;
  const coords = geom.coordinates as
    | number[][]
    | number[][][]
    | number[][][][];
  if (geom.type === 'Polygon' && Array.isArray(coords) && coords.length > 0) {
    const ring = Array.isArray(coords[0]) ? (coords[0] as number[][]) : null;
    const first = ring?.[0];
    if (first && first.length >= 2) return [first[1], first[0]];
  }
  if (
    geom.type === 'MultiPolygon' &&
    Array.isArray(coords) &&
    Array.isArray(coords[0]) &&
    Array.isArray((coords[0] as number[][])[0])
  ) {
    const first = (coords[0] as number[][][])[0][0];
    return [first[1], first[0]];
  }
  return null;
}
