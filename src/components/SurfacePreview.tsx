import type { Product, ProjectSurface } from '../types/calculator';
import { formatNumber } from '../utils/calculator';
export function SurfacePreview({ surface, product }: { surface: ProjectSurface; product: Product }) {
  const ratio = surface.widthM > 0 && surface.heightM > 0 ? surface.widthM / surface.heightM : 1.3;
  const w = ratio > 1.4 ? 152 : Math.max(50, 107 * ratio);
  const h = ratio > 1.4 ? Math.max(45, 152 / ratio) : 107;
  const x = 42 + (152 - w) / 2;
  const y = 29 + (107 - h) / 2;
  return <figure className="surface-preview"><svg viewBox="0 0 230 172" role="img" aria-label={`Esquema orientativo de ${surface.name}: ${formatNumber(surface.widthM)} por ${formatNumber(surface.heightM)} metros. No representa posiciones de aberturas.`}><rect x={x} y={y} width={w} height={h} rx="2" fill="#fff6d8" stroke="#8b7b4d" strokeWidth="1.3"/><path d={`M${x} ${y - 12} H${x + w} M${x} ${y - 16} V${y - 8} M${x + w} ${y - 16} V${y - 8}`} stroke="#6b6860" fill="none"/><text x={x + w / 2} y={y - 19} textAnchor="middle" fontSize="12" fill="#47433c">{formatNumber(surface.widthM)} m</text><path d={`M${x - 12} ${y} V${y + h} M${x - 16} ${y} H${x - 8} M${x - 16} ${y + h} H${x - 8}`} stroke="#6b6860" fill="none"/><text x={x - 20} y={y + h / 2} textAnchor="middle" fontSize="12" fill="#47433c" transform={`rotate(-90 ${x - 20} ${y + h / 2})`}>{formatNumber(surface.heightM)} m</text><text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize="17" fontWeight="600" fill="#292720">{formatNumber(surface.widthM * surface.heightM)} m²</text></svg><figcaption>{product.family === 'pisos' ? 'Piso' : product.family === 'cielos' ? 'Techo' : 'Superficie'} · esquema orientativo</figcaption></figure>;
}
