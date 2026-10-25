import { PRODUCTS, getProduct } from '../data/catalog';
import { CATEGORIES } from '../data/categories';
import { formatNumber } from '../utils/calculator';

export function ProductSelector({ selectedProductId, onSelectProduct, price, onPrice }: {
  selectedProductId: string; onSelectProduct: (id: string) => void;
  price?: number; onPrice: (id: string, value: string) => void;
}) {
  const product = getProduct(selectedProductId);
  return <section className="workspace-section" id="materiales" aria-labelledby="materials-title">
    <h2 id="materials-title">Material</h2>
    <div className="material-fields">
      <label>Familia<select value={product.family} onChange={e => onSelectProduct(PRODUCTS.find(p => p.family === e.target.value)!.id)}>
        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select></label>
      <label>Presentación<select value={product.id} onChange={e => onSelectProduct(e.target.value)}>
        {PRODUCTS.filter(p => p.family === product.family).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select></label>
    </div>
    <div className="selected-product">
      <div><strong>{product.widthM && product.heightM ? `${formatNumber(product.widthM)} × ${formatNumber(product.heightM)} m` : 'Caja de 5 m²'}</strong>
        <span>{formatNumber(product.coverageM2, 4)} m² / {product.saleUnit} · {product.environment}</span></div>
      <label>Precio por {product.saleUnit} (USD)<input type="number" inputMode="decimal" min="0" max="1000000" step="0.01" placeholder="Por cotizar" value={price ?? ''} onChange={e => onPrice(product.id, e.target.value)}/></label>
    </div>
  </section>;
}
