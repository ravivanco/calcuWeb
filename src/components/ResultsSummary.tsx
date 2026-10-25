import { TriangleAlert, ShoppingBag, Printer, Wrench } from 'lucide-react';
import type { CalculationResult, Product, QuoteLine } from '../types/calculator';
import { formatCurrency, formatNumber, unitLabel } from '../utils/calculator';

export function ResultsSummary({ product, result, lines, wastePercent, onAdd, onPrint }: {
  product: Product; result: CalculationResult; lines: QuoteLine[]; wastePercent: number; onAdd: () => boolean; onPrint: () => void;
}) {
  const main = lines.find(l => !l.isAccessory);
  const accessories = lines.filter(l => l.isAccessory);
  const priced = lines.filter(l => l.subtotalUSD !== null);
  const missing = lines.length - priced.length;
  const sum = (entries: QuoteLine[]) => entries.reduce((n, l) => n + (l.subtotalUSD ?? 0), 0);
  const amount = (entries: QuoteLine[]) => entries.some(l => l.subtotalUSD === null) ? 'Por cotizar' : formatCurrency(sum(entries));
  const wasteArea = result.targetAreaM2 - result.netAreaM2;
  const roundingArea = Math.max(0, result.purchasedCoverageM2 - result.targetAreaM2);
  return <aside className="results-sidebar" aria-label="Resumen del cálculo">
    <div className="estimate-header"><div className="estimate-title"><h2>{missing && priced.length ? 'Subtotal estimado' : 'Total estimado del proyecto'}</h2><span>USD</span></div>
      <strong className="estimate-total" aria-live="polite">{!result.isValid ? '—' : priced.length ? formatCurrency(sum(lines)) : 'Por cotizar'}</strong>
      <div className="estimate-subtotals"><span>Material: <b>{main ? amount([main]) : '—'}</b></span><span>Complementos: <b>{result.isValid ? amount(accessories) : '—'}</b></span></div>
      {result.isValid && missing > 0 && <p>{missing} {missing === 1 ? 'precio pendiente' : 'precios pendientes'}</p>}
    </div>
    <div className="estimate-body">
      {result.isValid ? <>
        <div className="main-material-result"><div className="material-result-heading"><div><span className="material-badge">Material principal</span><h3>{product.name}</h3><p>{product.widthM && product.heightM ? `${formatNumber(product.widthM)} × ${formatNumber(product.heightM)} m` : 'Caja de 5 m²'}</p></div><div className="material-quantity"><strong>{result.unitsToBuy}</strong><b>{unitLabel(product.saleUnit, result.unitsToBuy)}</b><small>{main?.unitPriceUSD == null ? 'Por cotizar' : `${formatCurrency(main.unitPriceUSD)} c/u`}</small></div></div>
          <dl className="coverage-grid"><div><dt>Área neta a cubrir</dt><dd>{formatNumber(result.netAreaM2)} m²</dd></div><div><dt>Cobertura comprada</dt><dd>{formatNumber(result.purchasedCoverageM2)} m²</dd><small>+{formatNumber(result.leftoverAreaM2)} m² extra</small></div></dl>
        </div>
        <div className="waste-breakdown"><div><h3>Material adicional</h3><span>{formatNumber(wastePercent)}% desperdicio</span></div><p><span>Reserva para cortes</span><b>+{formatNumber(wasteArea)} m²</b></p><p><span>Redondeo{result.layout.length ? ' y recortes' : ' a unidades completas'}</span><b>+{formatNumber(roundingArea)} m²</b></p></div>
        <div className="summary-complements"><h3><Wrench size={15}/> Complementos seleccionados <span>({accessories.length})</span></h3>
          {accessories.length ? <ul>{accessories.map(a => <li key={a.id}><div><strong>{a.name}</strong><small>{a.quantity} {unitLabel(a.unit, a.quantity)}{!a.available && ' · Conseguir por separado'}</small></div><b>{a.subtotalUSD === null ? 'Por cotizar' : formatCurrency(a.subtotalUSD)}</b></li>)}</ul> : <p>Selecciona los complementos que vas a utilizar.</p>}
        </div>
      </> : <div className="empty-summary"><h3>Completa las medidas</h3><p>El resumen se actualiza automáticamente.</p></div>}
      <div className="summary-actions"><button className="button-primary full-width" disabled={!result.isValid} onClick={onAdd}><ShoppingBag size={17}/> Añadir al presupuesto</button><button className="button-secondary full-width" disabled={!result.isValid} onClick={onPrint}><Printer size={16}/> Imprimir o guardar PDF</button></div>
      <div className="estimate-note"><strong><TriangleAlert size={14}/> Nota de instalación</strong><p>Confirma cortes, compatibilidad y rendimientos antes de comprar.{product.technicalNotes.length > 0 && ' Hay datos por confirmar en la ficha técnica.'}</p></div>
      <p className="estimate-footnote">Precios ingresados manualmente. Sin impuestos, flete ni mano de obra.</p>
    </div>
  </aside>;
}
