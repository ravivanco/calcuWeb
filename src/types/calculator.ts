export type CalculationMode = 'area' | 'layout';
export type FamilyId = 'pvc' | 'adhesivas' | 'geometricos' | 'wpet' | 'exteriores' | 'pisos' | 'cielos' | 'piedras' | 'wpc';
export type Texture = 'marble' | 'marble-dark' | 'bamboo' | 'wood' | 'slats' | 'slats-dark' | 'geometric' | 'stone' | 'onyx' | 'siding' | 'ceiling';

export interface Category { id: FamilyId; name: string; icon: string }

export interface AccessoryRule {
  id: string;
  name: string;
  unit: string;
  panelsPerUnit?: number;
  unitsPerPanel?: number;
  available?: boolean;
  sourceNote: string;
  manualQuantity?: boolean;
}

export interface Product {
  id: string;
  reference: string;
  name: string;
  family: FamilyId;
  description: string;
  widthM?: number;
  heightM?: number;
  coverageM2: number;
  publishedCoverageM2: number;
  saleUnit: 'pieza' | 'caja';
  environment: 'Interior' | 'Exterior' | 'Interior y exterior';
  installation: string;
  defaultMode: CalculationMode;
  texture: Texture;
  accessoryRules: AccessoryRule[];
  technicalNotes: string[];
  complements: string[];
  sourcePages: string;
}

export interface SurfaceOpening { id: string; name: string; widthM: number; heightM: number; quantity: number }
export interface ProjectSurface { id: string; name: string; widthM: number; heightM: number; measurementMode?: 'dimensions' | 'area'; areaM2?: number; orientation: 'vertical' | 'horizontal'; openings: SurfaceOpening[] }
export interface AccessorySelection { id: string; quantity?: number }
export interface ProjectInput { productId: string; projectName: string; customerName: string; wastePercent: number; mode: CalculationMode; surfaces: ProjectSurface[]; accessorySelection?: AccessorySelection[] }
export interface MaterialQuantity { id: string; name: string; unit: string; quantity: number; exactQuantity: number; available: boolean; sourceNote: string }
export interface CalculationResult {
  isValid: boolean;
  errors: string[];
  grossAreaM2: number;
  openingsAreaM2: number;
  netAreaM2: number;
  targetAreaM2: number;
  basePieces: number;
  unitsToBuy: number;
  reserveUnits: number;
  purchasedCoverageM2: number;
  leftoverAreaM2: number;
  layout: { surfaceId: string; columns: number; rows: number }[];
  accessories: MaterialQuantity[];
  warnings: string[];
  steps: string[];
}
export interface BudgetItem { id: string; createdAt: string; input: ProjectInput; product: Product; result: CalculationResult }
export interface QuoteLine { id: string; name: string; unit: string; quantity: number; unitPriceUSD: number | null; subtotalUSD: number | null; available: boolean; isAccessory: boolean }
export type PriceList = Record<string, number>;
