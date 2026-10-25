import { Check, Download, FolderOpen, Printer, ShoppingBag, UserRound, Droplets } from 'lucide-react';
import type { CalculationResult, Product, QuoteLine } from '../types/calculator';
import { sellerById } from '../data/sellers';
import { formatCurrency, formatNumber, quoteTotals, unitLabel } from '../utils/calculator';
import { SectionHeading } from './SectionHeading';
import { MaterialThumbnail } from './MaterialThumbnail';
export function ResultsSummary({ product, result, lines, sellerId, budgetCount, onAdd, onPrint, onExport, onBudget, added }: {
  product: Product; result: CalculationResult; lines: QuoteLine[]; sellerId: string | null; budgetCount: number; onAdd: () => void; onPrint: () => void; onExport: () => void; onBudget: () => void; added: boolean;
}) {
  const total = quoteTotals(lines);
  const seller = sellerById(sellerId);
  const main = lines.find(l => l.kind === 'main');
  const adhesive = lines.find(l => l.kind === 'adhesive');
  const extras = lines.filter(l => l.kind === 'accessory');
  const amount = !result.isValid ? '—' : total.hasPrices ? formatCurrency(total.amount) : 'Por cotizar';
  return <><aside className="results-sidebar" id="cotizacion" aria-label="Resumen de cotización" tabIndex={-1}>
    <SectionHeading number="5" title="Cotización" id="quote-title" detail={<span>USD</span>}/>
    <div className="estimate-header"><p className="estimate-label">{total.incomplete ? 'Subtotal de partidas con precio' : 'Total estimado'}</p><strong className={`estimate-total ${!total.hasPrices ? 'unpriced-total' : ''}`}>{amount}</strong><div className="quote-seller"><UserRound size={13} aria-hidden="true"/>{seller?.name ?? 'Vendedor sin asignar'}</div>{result.isValid && total.incomplete && <p className="quote-status"><span className="status-dot"/>Cotización incompleta{total.missingPriceCount > 0 && ` · ${total.missingPriceCount} ${total.missingPriceCount === 1 ? 'precio pendiente' : 'precios pendientes'}`}</p>}</div>
    <div className="estimate-body">{result.isValid ? <><div className="main-material-result"><MaterialThumbnail family={product.family}/><div><h3>{product.name}</h3><span className="material-unit-price">{main?.unitPriceUSD == null ? 'Precio por cotizar' : `${formatCurrency(main.unitPriceUSD)} / ${product.saleUnit}`}</span></div><div className="material-quantity"><strong>{result.unitsToBuy}</strong><span>{unitLabel(product.saleUnit, result.unitsToBuy)}</span></div></div>
      <dl className="coverage-grid"><div><dt>Área neta</dt><dd>{formatNumber(result.netAreaM2)} <span>m²</span></dd></div><div><dt>Cobertura comprada</dt><dd>{formatNumber(result.purchasedCoverageM2)} <span>m²</span></dd></div></dl>
      <dl className="waste-breakdown"><div><dt>Desperdicio · 10%</dt><dd>+{formatNumber(result.wasteAreaM2)} m²</dd></div><div><dt>Excedente por redondeo</dt><dd>+{formatNumber(result.roundingExcessM2)} m²</dd></div>{result.cutExcessM2 > 0 && <div><dt>Recortes del despiece</dt><dd>+{formatNumber(result.cutExcessM2)} m²</dd></div>}</dl>
      {adhesive && <div className={`summary-adhesive ${adhesive.quantity === null ? 'pending' : ''}`}><Droplets size={17} aria-hidden="true"/><div><strong>{adhesive.quantity === null ? 'Adhesivo por confirmar' : `Adhesivo incluido · ${adhesive.quantity} ${unitLabel(adhesive.unit, adhesive.quantity)}`}</strong><small>{adhesive.name}</small></div><b>{adhesive.subtotalUSD === null ? 'Por cotizar' : formatCurrency(adhesive.subtotalUSD)}</b></div>}
      {extras.length > 0 && <div className="summary-extras"><h3>Complementos seleccionados</h3>{extras.map(line => <div key={line.id}><span>{line.name}<small>{line.quantity} {unitLabel(line.unit, line.quantity)}</small></span><b>{line.subtotalUSD === null ? 'Por cotizar' : formatCurrency(line.subtotalUSD)}</b></div>)}</div>}
      {result.pendingRequirements.length > 0 && <p className="pending-summary">Falta configurar el rendimiento del adhesivo para esta presentación.</p>}
    </> : <div className="empty-summary"><h3>Revisa las medidas</h3><p>Usa valores mayores a cero. Las aberturas deben ocupar menos que la superficie.</p></div>}
    <div className="summary-actions"><button className={`button-primary full-width ${added ? 'just-added' : ''}`} disabled={!result.isValid} onClick={onAdd}>{added ? <Check size={17} aria-hidden="true"/> : <ShoppingBag size={17} aria-hidden="true"/>}{added ? 'Añadido al presupuesto' : 'Añadir al presupuesto'}</button><button className="button-secondary full-width" disabled={!result.isValid} onClick={onPrint}><Printer size={16} aria-hidden="true"/> Imprimir o guardar PDF</button><div className="summary-secondary-actions"><button className="text-button" disabled={!result.isValid} onClick={onExport}><Download size={15} aria-hidden="true"/> CSV</button><button className="text-button" onClick={onBudget}><FolderOpen size={15} aria-hidden="true"/> Guardados <span className="count-badge">{budgetCount}</span></button></div></div><p className="estimate-footnote">Precios manuales. Sin impuestos, flete ni mano de obra.</p></div>
  </aside></>;
}
