import { Check, Image, Sun, House } from 'lucide-react';
import { PRODUCTS, getProduct } from '../data/catalog';
import { CATEGORIES } from '../data/categories';
import { formatNumber } from '../utils/calculator';
import { MaterialThumbnail } from './MaterialThumbnail';
import { SectionHeading } from './SectionHeading';
import { NumericInput } from './NumericInput';
export function ProductSelector({ selectedProductId, onSelectProduct, price, onPrice }: { selectedProductId: string; onSelectProduct: (id: string) => void; price?: number; onPrice: (id: string, value: string) => void }) {
  const product = getProduct(selectedProductId);
  return <section className="workspace-section material-section" id="materiales" aria-labelledby="materials-title"><SectionHeading number="2" title="Material" id="materials-title" detail={<><Image size={13} aria-hidden="true"/> Imágenes ilustrativas</>}/>
    <div className="family-grid" role="group" aria-label="Familia de material">{CATEGORIES.map(category => <button key={category.id} aria-label={category.name} className={`family-button ${product.family === category.id ? 'selected' : ''}`} onClick={() => onSelectProduct(PRODUCTS.find(p => p.family === category.id)!.id)} aria-pressed={product.family === category.id}><MaterialThumbnail family={category.id}/><span>{category.name}</span>{product.family === category.id && <Check className="family-check" size={13} aria-hidden="true"/>}</button>)}</div>
    <div className="presentation-label">Presentación <span>{PRODUCTS.filter(p => p.family === product.family).length} opciones</span></div><div className="presentation-grid" role="group" aria-label="Presentación de material">{PRODUCTS.filter(p => p.family === product.family).map(p => <button className={`product-card ${p.id === product.id ? 'selected' : ''}`} aria-pressed={p.id === product.id} aria-label={`Seleccionar ${p.name}`} key={p.id} onClick={() => onSelectProduct(p.id)}><MaterialThumbnail family={p.family}/><span className="product-info"><strong>{p.name}</strong><span>{p.widthM && p.heightM ? `${formatNumber(p.widthM)} × ${formatNumber(p.heightM)} m` : 'Caja de 5 m²'}</span><span>{formatNumber(p.publishedCoverageM2)} m² · {p.environment === 'Exterior' ? <Sun size={11} aria-hidden="true"/> : <House size={11} aria-hidden="true"/>} {p.environment}</span></span><span className="product-check" aria-hidden="true">{p.id === product.id && <Check size={13}/>}</span></button>)}</div>
    <div className="material-price"><span>Venta por {product.saleUnit}<small>Cobertura de cálculo: {formatNumber(product.coverageM2, 4)} m²</small></span><label>Precio por {product.saleUnit} <span className="currency-label">USD</span><NumericInput key={product.id} money value={price} placeholder="Por cotizar" aria-label={`Precio de ${product.name}`} onValue={value => onPrice(product.id, value)}/></label></div>
  </section>;
}
