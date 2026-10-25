import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS, getProduct } from '../src/data/catalog';
import { getInstallationOptions } from '../src/data/installation';
import { buildQuote, calculateProject, parseUserNumber } from '../src/utils/calculator';
import { isProjectInput } from '../src/hooks/useProjectStorage';
import type { BudgetItem, ProjectInput } from '../src/types/calculator';
const input = (productId = 'wpc-290', changes: Partial<ProjectInput> = {}): ProjectInput => ({ productId, projectName: 'Sala', customerName: '', wastePercent: 0, mode: getProduct(productId).defaultMode, surfaces: [{ id: 's1', name: 'Pared', widthM: 3.5, heightM: 2.6, orientation: 'vertical', openings: [] }], ...changes });
const run = (v: ProjectInput) => calculateProject(getProduct(v.productId), v);
const snapshot = (v: ProjectInput, id = '1'): BudgetItem => ({ id, createdAt: '2026-10-25', input: v, product: getProduct(v.productId), result: run(v) });
test('catálogo de 20 presentaciones únicas y ejecución válida de cada una', () => { assert.equal(PRODUCTS.length, 20); assert.equal(new Set(PRODUCTS.map(p => p.id)).size, 20); for (const p of PRODUCTS) { const r = run(input(p.id)); assert.equal(r.isValid, true, p.name); assert.ok(Number.isFinite(r.unitsToBuy)); } });
test('piso usa caja de 5m² y redondeo a cajas completas', () => { const r = run(input('piso-pvc', { wastePercent: 10, surfaces: [{ ...input().surfaces[0]!, widthM: 5, heightM: 2 }] })); assert.equal(r.unitsToBuy, 3); assert.equal(r.basePieces, 2); assert.equal(r.reserveUnits, 1); });
test('una lámina exacta no compra dos por coma flotante', () => { const r = run(input('pvc-prime', { surfaces: [{ ...input().surfaces[0]!, widthM: 1.22, heightM: 2.44 }] })); assert.equal(r.unitsToBuy, 1); });
test('WPC 2.90m usa 3 vinchas, tornillos y tacos por panel y silicón por tres', () => { const r = run(input()); assert.equal(r.basePieces, 24); assert.equal(r.accessories.find(a => a.id === 'vinchas')!.quantity, 72); assert.equal(r.accessories.find(a => a.id === 'tornillos')!.quantity, 72); assert.equal(r.accessories.find(a => a.id === 'tacos')!.quantity, 72); assert.equal(r.accessories.find(a => a.id === 'gorilax')!.quantity, 8); });
test('la reserva agrega piezas pero no fijaciones de piezas sin instalar', () => { const a = run(input()), b = run(input('wpc-290', { wastePercent: 10 })); assert.equal(b.unitsToBuy, 27); assert.equal(a.accessories[0]!.quantity, b.accessories[0]!.quantity); });
test('orientación horizontal cambia columnas y filas', () => { const r = run(input('wpc-290', { surfaces: [{ ...input().surfaces[0]!, orientation: 'horizontal' }] })); assert.equal(r.unitsToBuy, 36); assert.deepEqual(r.layout[0], { surfaceId: 's1', columns: 2, rows: 18 }); });
test('abertura en despiece baja área, mantiene piezas y explica el supuesto', () => { const v = input(); v.surfaces[0]!.openings = [{ id: 'o', name: 'Puerta', widthM: .9, heightM: 2.1, quantity: 1 }]; const r = run(v); assert.equal(r.basePieces, 24); assert.ok(Math.abs(r.netAreaM2 - 7.21) < 1e-9); assert.ok(r.warnings.some(w => w.includes('no las piezas'))); });
test('aberturas sí reducen compra por área', () => { const v = input('pvc-prime'); const before = run(v).unitsToBuy; v.surfaces[0]!.openings = [{ id: 'o', name: 'Puerta', widthM: .9, heightM: 2.1, quantity: 1 }]; assert.ok(run(v).unitsToBuy < before); });
test('rechaza dimensiones cero, negativas, infinito y NaN', () => { for (const n of [0, -1, Infinity, NaN]) { const v = input(); v.surfaces[0]!.widthM = n; const r = run(v); assert.equal(r.isValid, false); assert.ok(r.errors.length); } });
test('superficies ausentes no causan excepción', () => { const r = run({ ...input(), surfaces: undefined } as unknown as ProjectInput); assert.equal(r.isValid, false); assert.ok(r.errors.length); });
test('rechaza margen mayor a 50 y método desconocido', () => { assert.equal(run(input('wpc-290', { wastePercent: 51 })).isValid, false); assert.equal(run({ ...input(), mode: 'otro' } as unknown as ProjectInput).isValid, false); });
test('caja de piso no permite despiece sin dimensiones de tablón', () => assert.equal(run(input('piso-pvc', { mode: 'layout' })).isValid, false));
test('rechaza abertura fuera del muro y cantidades fraccionarias', () => { const v = input(); v.surfaces[0]!.openings = [{ id: 'o', name: 'Puerta', widthM: 4, heightM: 1, quantity: 1 }]; assert.equal(run(v).isValid, false); v.surfaces[0]!.openings[0]!.widthM = 1; v.surfaces[0]!.openings[0]!.quantity = 1.5; assert.equal(run(v).isValid, false); });
test('no inventa cantidades pendientes de PVC, Metal Siding y WPC Small', () => { for (const id of ['pvc-prime', 'metal-siding']) { const p = getProduct(id); assert.equal(p.accessoryRules.length, 0); assert.ok(p.technicalNotes.length); } assert.equal(getProduct('wpc-small').accessoryRules.length, 1); });
test('silicón de piedra traslúcida figura fuera del catálogo disponible', () => { const r = run(input('piedra-traslucida')); assert.equal(r.accessories[0]!.available, false); });
test('WPET usa los tres anchos del manual', () => assert.deepEqual(PRODUCTS.filter(p => p.family === 'wpet').map(p => p.widthM), [.16, .20, .30]));
test('presupuesto consolida consumo antes de redondear envases', () => { const v = input('geometrico-clasico', { surfaces: [{ ...input().surfaces[0]!, widthM: .6, heightM: 2.4 }] }); assert.equal(run(v).accessories[0]!.quantity, 1); const quote = buildQuote([snapshot(v), snapshot(v, '2')], {}); assert.equal(quote.find(l => l.id === 'gorilax')!.quantity, 1); assert.equal(quote.find(l => l.id === v.productId)!.quantity, 8); });
test('no convierte precios ausentes en cero ni cotiza el silicón no disponible', () => { const quote = buildQuote([snapshot(input('piedra-traslucida'))], { 'silicona-transparente': 20 }); assert.ok(quote.every(l => l.subtotalUSD === null)); });
test('precio asignado se multiplica por cantidad y redondea a centavos', () => { const v = input('piso-pvc'); const q = buildQuote([snapshot(v)], { 'piso-pvc': 19.99 }); assert.equal(q[0]!.subtotalUSD, q[0]!.quantity * 19.99); });
test('identificadores de materiales mantienen sus cantidades separadas', () => { const q = buildQuote([snapshot(input('pvc-prime')), snapshot(input('pvc-delux'))], {}); assert.equal(q.filter(l => !l.isAccessory).length, 2); });
test('lector de números admite coma decimal y rechaza texto parcial', () => { assert.equal(parseUserNumber('2,5'), 2.5); for (const s of ['2abc', '1.234,56', 'Infinity', '']) assert.ok(Number.isNaN(parseUserNumber(s))); });
test('estado guardado inválido no se toma como formulario válido', () => { assert.equal(isProjectInput({ productId: 'wpc-290' }), false); assert.equal(isProjectInput(input()), true); const v = input(); v.surfaces[0]!.widthM = Infinity; assert.equal(isProjectInput(v), false); });

test('área directa descuenta aberturas, aplica desperdicio y compra cajas completas', () => {
  const v = input('piso-pvc', { wastePercent: 10 });
  v.surfaces[0] = { ...v.surfaces[0]!, measurementMode: 'area', areaM2: 12, widthM: 0, heightM: 0, openings: [{ id: 'o', name: 'Puerta', widthM: 1, heightM: 2, quantity: 1 }] };
  const r = run(v);
  assert.equal(r.isValid, true);
  assert.equal(r.grossAreaM2, 12);
  assert.equal(r.netAreaM2, 10);
  assert.equal(r.targetAreaM2, 11);
  assert.equal(r.unitsToBuy, 3);
  assert.equal(r.leftoverAreaM2, 5);
  assert.equal(isProjectInput(v), true);
});

test('área directa no permite despiece ni aberturas que agoten el área', () => {
  const v = input('wpc-290');
  v.surfaces[0] = { ...v.surfaces[0]!, measurementMode: 'area', areaM2: 10 };
  assert.equal(run(v).isValid, false);
  v.mode = 'area';
  assert.equal(run(v).isValid, true);
  v.surfaces[0]!.openings = [{ id: 'o', name: 'Ventanas', widthM: 2, heightM: 2.5, quantity: 2 }];
  assert.equal(run(v).isValid, false);
  v.surfaces[0]!.openings = [];
  for (const n of [0, -1, NaN, Infinity, 1_000_001]) {
    v.surfaces[0]!.areaM2 = n;
    assert.equal(run(v).isValid, false);
  }
});

test('combina superficies por dimensiones y por m² sin perder precisión', () => {
  const v = input('pvc-prime', { wastePercent: 10 });
  v.surfaces.push({ id: 's2', name: 'Techo', widthM: 0, heightM: 0, measurementMode: 'area', areaM2: 10, orientation: 'vertical', openings: [] });
  const r = run(v);
  assert.equal(r.isValid, true);
  assert.ok(Math.abs(r.netAreaM2 - 19.1) < 1e-9);
  assert.equal(r.unitsToBuy, 8);
});

test('solo los complementos seleccionados entran en la cotización', () => {
  const v = input('wpc-290', { accessorySelection: [] });
  assert.equal(run(v).accessories.length, 0);
  v.accessorySelection = [{ id: 'gorilax' }, { id: 'vinchas' }];
  const r = run(v);
  assert.equal(r.isValid, true);
  assert.deepEqual(r.accessories.map(a => a.id), ['gorilax', 'vinchas']);
  assert.equal(r.accessories[0]!.quantity, 8);
  assert.equal(r.accessories[1]!.quantity, 72);
  const quote = buildQuote([snapshot(v)], { 'wpc-290': 10, gorilax: 5, vinchas: .1, tornillos: 100 });
  assert.equal(quote.length, 3);
  assert.equal(quote.some(l => l.id === 'tornillos'), false);
  assert.equal(quote.reduce((sum, l) => sum + l.subtotalUSD!, 0), 287.2);
});

test('complementos sin rendimiento usan la cantidad manual y suman su precio', () => {
  const p = getProduct('pvc-prime');
  const profile = getInstallationOptions(p).find(o => o.name === 'Perfil de acabado')!;
  const v = input(p.id, { accessorySelection: [{ id: 'gorilax', quantity: 2 }, { id: profile.id, quantity: 3 }] });
  const r = run(v);
  assert.equal(r.isValid, true);
  assert.deepEqual(r.accessories.map(a => a.quantity), [2, 3]);
  const quote = buildQuote([snapshot(v)], { 'pvc-prime': 10, gorilax: 5, [profile.id]: 2 });
  assert.equal(quote.reduce((sum, l) => sum + l.subtotalUSD!, 0), 56);
  for (const quantity of [0, -1, 1.5, NaN, Infinity, 1_000_001]) {
    v.accessorySelection![0]!.quantity = quantity;
    assert.equal(run(v).isValid, false);
  }
});

test('rechaza complementos de otro material, duplicados y cambios al rendimiento automático', () => {
  const v = input('pvc-prime', { accessorySelection: [{ id: 'silicona-transparente', quantity: 1 }] });
  assert.equal(run(v).isValid, false);
  v.accessorySelection = [{ id: 'gorilax', quantity: 1 }, { id: 'gorilax', quantity: 1 }];
  assert.equal(run(v).isValid, false);
  assert.equal(run(input('wpc-290', { accessorySelection: [{ id: 'gorilax', quantity: 999 }] })).isValid, false);
});
