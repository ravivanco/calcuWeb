export type CalculationMode = 'area' | 'layout';
export type FamilyId = 'pvc' | 'adhesivas' | 'geometricos' | 'wpet' | 'exteriores' | 'pisos' | 'cielos' | 'piedras' | 'wpc';
export type Texture = 'marble' | 'marble-dark' | 'bamboo' | 'wood' | 'slats' | 'slats-dark' | 'geometric' | 'stone' | 'onyx' | 'siding' | 'ceiling';
export interface Category { id: FamilyId; name: string; icon: string }
export interface AccessoryRule { id: string; name: string; unit: string; panelsPerUnit?: number; unitsPerPanel?: number; available?: boolean; sourceNote: string; manualQuantity?: boolean }
export interface Product {
  id: string; reference: string; name: string; family: FamilyId; description: string;
  widthM?: number; heightM?: number; coverageM2: number; publishedCoverageM2: number;
  saleUnit: 'pieza' | 'caja'; environment: 'Interior' | 'Exterior' | 'Interior y exterior';
  installation: string; defaultMode: CalculationMode; texture: Texture; accessoryRules: AccessoryRule[];
  technicalNotes: string[]; complements: string[]; sourcePages: string;
}
export interface SurfaceOpening { id: string; name: string; widthM: number; heightM: number; quantity: number }
export interface ProjectSurface { id: string; name: string; widthM: number; heightM: number; measurementMode?: 'dimensions' | 'area'; areaM2?: number; orientation: 'vertical' | 'horizontal'; openings: SurfaceOpening[] }
export interface AccessorySelection { id: string; quantity?: number }
export interface ProjectInput { productId: string; sellerId: string | null; mode: CalculationMode; surfaces: ProjectSurface[]; accessorySelection: AccessorySelection[] }
export type MaterialKind = 'main' | 'adhesive' | 'accessory';
export interface MaterialQuantity { id: string; name: string; unit: string; quantity: number | null; exactQuantity: number | null; available: boolean; sourceNote: string; kind: 'adhesive' | 'accessory'; manual: boolean }
export interface CalculationResult {
  isValid: boolean; errors: string[]; grossAreaM2: number; openingsAreaM2: number; netAreaM2: number;
  targetAreaM2: number; basePieces: number; unitsToBuy: number; reserveUnits: number; purchasedCoverageM2: number;
  leftoverAreaM2: number; wasteAreaM2: number; roundingExcessM2: number; cutExcessM2: number;
  layout: { surfaceId: string; columns: number; rows: number }[];
  accessories: MaterialQuantity[]; warnings: string[]; pendingRequirements: string[];
}
export interface BudgetItem { id: string; createdAt: string; input: ProjectInput; product: Product; result: CalculationResult }
export interface QuoteLine {
  id: string; priceId: string; name: string; unit: string; quantity: number | null;
  unitPriceUSD: number | null; subtotalUSD: number | null; available: boolean; isAccessory: boolean; kind: MaterialKind;
  sellerNames: string[]; note: string; netAreaM2?: number; purchasedCoverageM2?: number; wasteAreaM2?: number; roundingExcessM2?: number;
}
export type PriceList = Record<string, number>;
