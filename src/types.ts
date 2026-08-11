export enum LicenseType {
  PERPETUAL = 'PERPETUAL',
  FLEX = 'FLEX',
}

export interface SteelHeadModel {
  name: string;
  skuPrefix: string;
  series: '80' | '90';
}

export interface SiteConfig {
  id: string;
  name: string;
  bandwidth: number; // Mbps
  selectedModel: SteelHeadModel | null;
  licenseType: LicenseType;
  selectedLicense: string | null;
  selectedSupportSku: string | null;
  licenseTerm?: '1yr' | '3yr' | '5yr' | null;
  supportTerm?: '1yr' | '3yr' | '5yr' | null;
  isHA: boolean;
  isSaas?: boolean;
  azureRegion?: string;
  o365UserCount?: number;
  saasTerm?: '1yr' | '3yr' | '5yr' | null;
  selectedSaasSku?: string | null;
  selectedNicSku?: string | null;
  selectedNicQty?: number;
  selectedNicSku2?: string | null;
  selectedNicQty2?: number;
}

export interface PricingItem {
  partNumber: string;
  description: string;
  listPrice: number;
  uom: string;
  accountType?: string;
  serviceLevel?: string;
  haBundleEnabled?: string;
  dynamicPriceFactor?: string;
}
