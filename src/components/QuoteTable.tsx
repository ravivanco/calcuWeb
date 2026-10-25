import type { PriceList, QuoteLine } from '../types/calculator';
import { formatCurrency, unitLabel } from '../utils/calculator';
export function QuoteTable({ lines, editable = false, prices = {}, onPrice }: { lines: QuoteLine[]; editable?: boolean; prices?: PriceList; onPrice?: (id: string, value: string) => void }) {
  return <div className="table-scroll"><table className="quote-table"><thead><tr><th>Material</th><th>Cantidad</th><th>Precio USD</th><th>Subtotal</th></tr></thead><tbody>{lines.map(line => <tr key={line.id}><td><strong>{line.name}</strong><small>{line.isAccessory ? 'Complemento de instalación' : 'Material principal'}{!line.available && ' · No disponible en Decokasa'}</small></td><td>{line.quantity}<small>{unitLabel(line.unit, line.quantity)}</small></td><td>{editable && line.available ? <input className="price-input" aria-label={`Precio de ${line.name}`} type="number" min="0" max="1000000" step="0.01" placeholder="Sin precio" value={prices[line.id] ?? ''} onChange={e => onPrice?.(line.id, e.target.value)}/> : line.unitPriceUSD === null ? 'Por cotizar' : formatCurrency(line.unitPriceUSD)}</td><td>{line.subtotalUSD === null ? '—' : formatCurrency(line.subtotalUSD)}</td></tr>)}</tbody></table></div>;
}
export function QuoteTotals({ lines }: { lines: QuoteLine[] }) {
  const priced = lines.filter(l => l.subtotalUSD !== null);
  const missing = lines.length - priced.length;
  return <div className="quote-totals"><div><span>{missing ? 'Subtotal de partidas con precio' : 'Total de materiales'}</span><strong>{priced.length ? formatCurrency(priced.reduce((s, l) => s + l.subtotalUSD!, 0)) : 'Por cotizar'}</strong></div><p>{missing > 0 ? `${missing} ${missing === 1 ? 'partida pendiente' : 'partidas pendientes'} de precio o disponibilidad. ` : ''}Precios ingresados por el vendedor. No se han agregado impuestos, flete ni mano de obra.</p></div>;
}
