import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG_VERSION, getProduct } from '../src/data/catalog';
import { SELLERS } from '../src/data/sellers';
import { buildQuote, calculateProject } from '../src/utils/calculator';
import { decodeWorkspace, encodeWorkspace, getDefaultInput, isProjectInput, withMeasurement } from '../src/utils/storage';
const snapshot = () => { const input = getDefaultInput('wpc-290'); input.sellerId = SELLERS[0]!.id; input.accessorySelection = [{ id: 'vinchas' }]; const product = getProduct(input.productId); return { id: 'saved', createdAt: '2026-10-25', input: structuredClone(input), product, result: calculateProject(product, input) }; };
test('lista de vendedores exacta, sin selección por defecto', () => {
  assert.deepEqual(SELLERS.map(s => s.name), ['Marlon Quishpe','Cinthya García','Keyssi Ruiz','Jessica Guevara','Alejandro Revelo','Salomé Benavides','Nataly Franco','Thalía Benavides','Wendy Chicaiza','Margot Revelo','Nayeli Yánez','Daniela Flores','Gabriela Auqui','Melanie Baque','Merly Calle']); assert.equal(new Set(SELLERS.map(s => s.id)).size, 15); assert.equal(getDefaultInput().sellerId, null);
});
test('persistencia y vendedor histórico independientes del vendedor actual', () => {
  const saved = snapshot(), current = structuredClone(saved.input); current.sellerId = SELLERS[1]!.id; const restored = decodeWorkspace(JSON.parse(encodeWorkspace({ input: current, items: [saved], prices: { gorilax: 6 } })));
  assert.equal(restored.input.sellerId, SELLERS[1]!.id); assert.equal(restored.items[0]!.input.sellerId, SELLERS[0]!.id); assert.deepEqual(restored.input.accessorySelection, [{ id: 'vinchas' }]); assert.equal(restored.prices.gorilax, 6); assert.deepEqual(buildQuote(restored.items, restored.prices)[0]!.sellerNames, ['Marlon Quishpe']);
});
test('migra reserva antigua a 10% y quita el checkbox de adhesivo sin perder complementos', () => {
  const saved = snapshot(); const legacy = { ...saved.input, sellerId: undefined, wastePercent: 5, projectName: 'Anterior', customerName: 'Cliente', accessorySelection: [{ id: 'gorilax', quantity: 999 }, { id: 'vinchas' }] };
  const restored = decodeWorkspace({ version: CATALOG_VERSION, input: legacy, items: [{ ...saved, input: legacy }], prices: {} }); assert.equal(restored.input.sellerId, null); assert.deepEqual(restored.input.accessorySelection, [{ id: 'vinchas' }]); assert.ok(!('wastePercent' in restored.input)); assert.ok(!('projectName' in restored.input)); const r = restored.items[0]!.result; assert.equal(r.unitsToBuy, 24); assert.equal(r.accessories[0]!.quantity, 7); assert.ok(restored.notice.includes('10% fijo'));
});
test('medidas actuales dañadas no eliminan presupuesto ni precios válidos', () => {
  const saved = snapshot(); const restored = decodeWorkspace({ version: CATALOG_VERSION, input: { productId: 'piso-pvc' }, items: [saved], prices: { 'piso-pvc': 19.99, falso: 2, gorilax: -1, vinchas: 1.234 } }); assert.equal(restored.items.length, 1); assert.deepEqual(restored.prices, { 'piso-pvc': 19.99 }); assert.ok(restored.notice);
});
test('datos no compatibles y vendedor desconocido no se restauran como válidos', () => {
  assert.equal(decodeWorkspace({ version: 'otro' }).items.length, 0); const v = getDefaultInput(); assert.equal(isProjectInput({ ...v, sellerId: 'falso' }), false); assert.equal(isProjectInput({ ...v, accessorySelection: 'gorilax' }), false); v.surfaces[0]!.measurementMode = 'area'; assert.equal(isProjectInput(v), false); v.surfaces[0]!.areaM2 = 12; assert.equal(isProjectInput(v), true); v.surfaces[0]!.areaM2 = NaN; assert.equal(isProjectInput(v), false);
});
test('cambiar a área directa conserva vendedor y complementos, cambia método de cálculo', () => {
  const saved = snapshot(); const v = withMeasurement({ ...saved.input, mode: 'layout' }, saved.input.surfaces[0]!.id, { measurementMode: 'area', areaM2: 12 }); assert.equal(v.mode, 'area'); assert.equal(v.sellerId, SELLERS[0]!.id); assert.deepEqual(v.accessorySelection, saved.input.accessorySelection); assert.equal(v.surfaces[0]!.areaM2, 12);
});
