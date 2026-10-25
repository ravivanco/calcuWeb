import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS, getProduct } from '../src/data/catalog';
import { getAdhesiveRequirement, getInstallationOptions } from '../src/data/installation';
import { SELLERS } from '../src/data/sellers';
import { buildQuote, calculateProject, parseUserNumber, quoteToCsv, quoteTotals, WASTE_PERCENT } from '../src/utils/calculator';
import { getDefaultInput } from '../src/utils/storage';
import type { BudgetItem, ProjectInput } from '../src/types/calculator';
const input = (id = 'wpc-290', changes: Partial<ProjectInput> = {}): ProjectInput => ({ ...getDefaultInput(id), sellerId: SELLERS[0]!.id, ...changes });
const run = (v: ProjectInput) => calculateProject(getProduct(v.productId), v);
const snapshot = (v: ProjectInput, id = '1'): BudgetItem => ({ id, createdAt: '2026-10-25', input: structuredClone(v), product: getProduct(v.productId), result: run(v) });
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-8, `${a} ≠ ${b}`);
test('las 20 presentaciones conservan coberturas geométricas y calculan sin errores', () => {
  assert.equal(PRODUCTS.length, 20); assert.equal(new Set(PRODUCTS.map(p => p.id)).size, 20);
  for (const p of PRODUCTS) { if (p.widthM && p.heightM) near(p.coverageM2, p.widthM * p.heightM); assert.equal(run(input(p.id)).isValid, true, p.name); }
  assert.deepEqual(PRODUCTS.filter(p => p.family === 'wpet').map(p => p.widthM), [.16, .20, .30]);
});
test('el desperdicio es siempre 10%, incluso si llegan campos antiguos del 5%', () => {
  assert.equal(WASTE_PERCENT, 10);
  const clean = input('piso-pvc'); clean.surfaces[0]!.measurementMode = 'area'; clean.surfaces[0]!.areaM2 = 10;
  for (const wastePercent of [0, 5, 10, 99]) { const r = run({ ...clean, wastePercent } as ProjectInput); assert.equal(r.unitsToBuy, 3); near(r.wasteAreaM2, 1); near(r.roundingExcessM2, 4); near(r.leftoverAreaM2, 5); }
});
test('redondea cajas completas y separa desperdicio de excedente', () => {
  const v = input('piso-pvc'); v.surfaces[0]!.measurementMode = 'area'; v.surfaces[0]!.areaM2 = 12;
  v.surfaces[0]!.openings = [{ id: 'o', name: 'Puerta', widthM: 1, heightM: 2, quantity: 1 }];
  const r = run(v); assert.equal(r.netAreaM2, 10); assert.equal(r.basePieces, 2); assert.equal(r.unitsToBuy, 3); assert.equal(r.purchasedCoverageM2, 15); assert.equal(r.targetAreaM2, 11); near(r.wasteAreaM2 + r.roundingExcessM2, r.leftoverAreaM2);
});
test('no usa coberturas publicadas redondeadas ni añade una pieza por errores flotantes', () => {
  const v = input('pvc-prime'); v.surfaces[0]!.measurementMode = 'area'; v.surfaces[0]!.areaM2 = getProduct(v.productId).coverageM2 / 1.1;
  assert.equal(run(v).unitsToBuy, 1); v.surfaces[0]!.areaM2! += .001; assert.equal(run(v).unitsToBuy, 2);
});
test('adhesivo obligatorio aunque no haya complementos seleccionados y sin reserva', () => {
  const r = run(input()); assert.equal(r.basePieces, 21); assert.equal(r.unitsToBuy, 24); assert.deepEqual(r.accessories.map(a => [a.id, a.kind, a.quantity]), [['gorilax', 'adhesive', 7]]);
  const q = buildQuote([snapshot(input())], { 'wpc-290': 10, gorilax: 6 }); assert.equal(quoteTotals(q).amount, 282); assert.equal(quoteTotals(q).incomplete, false);
});
test('adhesivo se recalcula con medidas y puertas, siempre sobre piezas base', () => {
  const v = input(); const before = run(v); v.surfaces[0]!.openings = [{ id: 'o', name: 'Puerta', widthM: .9, heightM: 2.1, quantity: 1 }];
  const after = run(v); near(after.netAreaM2, 7.21); assert.equal(after.basePieces, 17); assert.equal(after.accessories[0]!.quantity, 6); assert.ok(after.accessories[0]!.quantity! < before.accessories[0]!.quantity!);
  v.surfaces[0]!.widthM = 7; assert.equal(run(v).accessories[0]!.quantity, 13);
});
test('cada presentación utiliza exclusivamente su rendimiento confirmado', () => {
  const rates: Record<string, number> = { 'geometrico-clasico': 8, 'geometrico-design': 2, 'wpet-s': 3, 'wpet-m': 3, 'wpet-l': 3, 'piedra-flexible': 4, 'piedra-pu': 4, 'piedra-traslucida': 4, 'wpc-290': 3, 'wpc-small': 3 };
  for (const [id, rate] of Object.entries(rates)) { const r = run(input(id)); const a = r.accessories.find(a => a.kind === 'adhesive')!; near(a.exactQuantity!, r.basePieces / rate); assert.equal(a.quantity, Math.ceil(r.basePieces / rate)); }
});
test('PVC con rendimiento ambiguo permanece pendiente aunque se asignen todos los precios', () => {
  for (const p of PRODUCTS.filter(p => p.family === 'pvc')) { assert.equal(getAdhesiveRequirement(p).status, 'pending'); const v = input(p.id), r = run(v); assert.equal(r.isValid, true); assert.equal(r.accessories[0]!.quantity, null); assert.ok(r.pendingRequirements[0]!.includes('1 x plancha')); const q = buildQuote([snapshot(v)], { [p.id]: 10, gorilax: 6 }); const total = quoteTotals(q); assert.equal(total.incomplete, true); assert.equal(total.pendingCount, 1); assert.equal(total.missingPriceCount, 0); assert.equal(q[1]!.subtotalUSD, null); assert.equal(total.amount, r.unitsToBuy * 10); }
});
test('autoadhesivos y fijación mecánica no reciben pegamento', () => {
  for (const id of ['adhesiva-3m', 'adhesiva-satin', 'piso-pvc', 'wpc-exterior', 'metal-siding', 'cielo-pvc']) { assert.equal(getAdhesiveRequirement(getProduct(id)).status, 'not-required'); assert.equal(run(input(id)).accessories.length, 0); }
});
test('silicón transparente mantiene su condición del manual y no toma precio como disponible', () => {
  const q = buildQuote([snapshot(input('piedra-traslucida'))], { 'piedra-traslucida': 10, 'silicona-transparente': 6 }); assert.equal(q[1]!.available, false); assert.equal(q[1]!.unitPriceUSD, null); assert.equal(quoteTotals(q).incomplete, true);
});
test('complementos automáticos solo se incluyen al seleccionarlos', () => {
  const v = input('wpc-290', { accessorySelection: [{ id: 'vinchas' }, { id: 'tornillos' }, { id: 'tacos' }] }); const r = run(v); assert.equal(r.isValid, true); assert.deepEqual(r.accessories.map(a => a.quantity), [7, 63, 63, 63]);
  v.accessorySelection = [{ id: 'vinchas' }]; const q = buildQuote([snapshot(v)], { 'wpc-290': 10, gorilax: 6, vinchas: .1, tornillos: 100 }); assert.equal(q.some(l => l.id === 'tornillos'), false); assert.equal(quoteTotals(q).amount, 288.3);
});
test('complementos manuales no inventan consumo y validan cantidades enteras', () => {
  const p = getProduct('pvc-prime'), option = getInstallationOptions(p).find(o => o.name === 'Perfil de acabado')!; assert.equal(option.manualQuantity, true);
  const v = input(p.id, { accessorySelection: [{ id: option.id, quantity: 3 }] }); const r = run(v); assert.equal(r.isValid, true); assert.equal(r.accessories[1]!.manual, true); assert.equal(r.accessories[1]!.quantity, 3);
  const q = buildQuote([snapshot(v)], { [p.id]: 10, [option.id]: 2 }); assert.equal(q.find(l => l.id === option.id)!.subtotalUSD, 6);
  for (const n of [0, -1, 1.5, NaN, Infinity, 1_000_001]) { v.accessorySelection[0]!.quantity = n; assert.equal(run(v).isValid, false); }
});
test('rechaza manipular adhesivo, cantidades automáticas, duplicados y complementos incompatibles', () => {
  for (const accessorySelection of [[{ id: 'gorilax', quantity: 999 }], [{ id: 'vinchas', quantity: 999 }], [{ id: 'silicona-transparente' }], [{ id: 'vinchas' }, { id: 'vinchas' }]]) assert.equal(run(input('wpc-290', { accessorySelection })).isValid, false);
});
test('el presupuesto consolida consumos exactos antes de redondear envases', () => {
  const v = input('geometrico-clasico'); v.surfaces[0]!.measurementMode = 'area'; v.surfaces[0]!.areaM2 = .36;
  const q = buildQuote([snapshot(v), snapshot(v, '2')], { gorilax: 5 }); assert.equal(q.find(l => l.id === 'gorilax')!.quantity, 1); assert.equal(q.find(l => l.id === 'gorilax')!.subtotalUSD, 5); assert.equal(q.find(l => l.id === v.productId)!.quantity, 4);
});
test('un adhesivo pendiente no contamina el rendimiento de otra presentación', () => {
  const q = buildQuote([snapshot(input('pvc-prime')), snapshot(input('wpc-290'), '2')], { gorilax: 6 }); assert.equal(q.filter(l => l.kind === 'adhesive').length, 2); assert.equal(q.find(l => l.id === 'gorilax')!.quantity, 7); assert.equal(q.find(l => l.id.startsWith('pending:'))!.quantity, null);
});
test('precios ausentes no se convierten en cero y cero explícito es válido', () => {
  const item = snapshot(input('piso-pvc')); assert.equal(quoteTotals(buildQuote([item], {})).hasPrices, false); const zero = buildQuote([item], { 'piso-pvc': 0 }); assert.equal(zero[0]!.subtotalUSD, 0); assert.equal(quoteTotals(zero).incomplete, false);
});
test('despiece conservador mantiene orientación y explica recortes separados', () => {
  const v = input('wpc-290', { mode: 'layout' }); const r = run(v); assert.equal(r.basePieces, 24); assert.equal(r.unitsToBuy, 27); assert.equal(r.accessories[0]!.quantity, 8); near(r.wasteAreaM2 + r.roundingExcessM2 + r.cutExcessM2, r.leftoverAreaM2);
  v.surfaces[0]!.orientation = 'horizontal'; assert.equal(run(v).basePieces, 36); v.surfaces[0]!.openings = [{ id: 'o', name: 'Puerta', widthM: .9, heightM: 2.1, quantity: 1 }]; assert.equal(run(v).basePieces, 36);
});
test('área directa combina varias superficies y no acepta despiece sin dimensiones', () => {
  const v = input('piso-pvc'); v.surfaces.push({ id: 's2', name: 'Suelo', widthM: 0, heightM: 0, measurementMode: 'area', areaM2: 10, orientation: 'vertical', openings: [] }); near(run(v).netAreaM2, 19.1); assert.equal(run(v).unitsToBuy, 5); v.mode = 'layout'; assert.equal(run(v).isValid, false);
});
test('rechaza medidas inválidas, aberturas fuera de límites y superficies ausentes', () => {
  for (const n of [0, -1, Infinity, NaN, 1001]) { const v = input(); v.surfaces[0]!.widthM = n; assert.equal(run(v).isValid, false); }
  assert.equal(run({ ...input(), surfaces: undefined } as unknown as ProjectInput).isValid, false);
  const v = input(); for (const o of [{ widthM: 5, heightM: 1, quantity: 1 }, { widthM: 1, heightM: 1, quantity: 1.5 }, { widthM: 3.5, heightM: 2.6, quantity: 1 }]) { v.surfaces[0]!.openings = [{ id: 'o', name: 'Puerta', ...o }]; assert.equal(run(v).isValid, false); }
});
test('números con coma decimal y texto parcial se tratan correctamente', () => { assert.equal(parseUserNumber('2,5'), 2.5); for (const s of ['2abc', '1.234,56', 'Infinity', '']) assert.ok(Number.isNaN(parseUserNumber(s))); });
test('CSV conserva vendedor, cantidades, importes y pendiente sin fabricar un subtotal', () => {
  const v = input('pvc-prime'); const q = buildQuote([snapshot(v)], { [v.productId]: 10 }); const csv = quoteToCsv(q); assert.ok(csv.startsWith('\uFEFF')); assert.ok(csv.includes('Marlon Quishpe')); assert.ok(csv.includes('Adhesivo por confirmar')); assert.ok(csv.includes('"10"')); assert.ok(csv.includes('Excedente por redondeo m²')); assert.ok(!csv.includes('undefined')); assert.equal(quoteTotals(q).pendingCount, 1);
});
test('CSV neutraliza fórmulas y escapa comillas en campos de texto', () => { const q = buildQuote([snapshot(input())], {}); q[0]!.name = '=SUM(1,2)"'; assert.ok(quoteToCsv(q).includes('"\'=SUM(1,2)"""')); });
test('cotizaciones consolidadas mantienen vendedores distintos; sin asignar no es completa', () => {
  const a = input('piso-pvc'), b = input('piso-pvc', { sellerId: SELLERS[1]!.id }); const q = buildQuote([snapshot(a), snapshot(b, '2')], { 'piso-pvc': 20 }); assert.deepEqual(q[0]!.sellerNames, ['Marlon Quishpe', 'Cinthya García']); a.sellerId = null; assert.equal(quoteTotals(buildQuote([snapshot(a)], { 'piso-pvc': 20 })).incomplete, true);
});
