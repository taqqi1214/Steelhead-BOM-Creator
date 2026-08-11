import { SteelHeadModel } from './types';

export const AT_SERIES: SteelHeadModel[] = [
  { name: 'CXA 580', skuPrefix: 'CXA-00580-B110', series: '80' },
  { name: 'CXA 780', skuPrefix: 'CXA-00780-B110', series: '80' },
  { name: 'CXA 3080', skuPrefix: 'CXA-03080-B110', series: '80' },
  { name: 'CXA 5080', skuPrefix: 'CXA-05080-B010', series: '80' },
  { name: 'CXA 7080-B010', skuPrefix: 'CXA-07080-B010', series: '80' },
  { name: 'CXA 7080-B020', skuPrefix: 'CXA-07080-B020', series: '80' },
  { name: 'CXA 7080-B030', skuPrefix: 'CXA-07080-B030', series: '80' },
];

export const SERIES_90: SteelHeadModel[] = [
  { name: '2090', skuPrefix: 'CXA-02090-BASE', series: '90' },
  { name: '4090', skuPrefix: 'CXA-04090-BASE', series: '90' },
  { name: '6090', skuPrefix: 'CXA-06090-BASE', series: '90' },
  { name: '8090', skuPrefix: 'CXA-08090-BASE', series: '90' },
];

export const LICENSE_MAPPINGS: Record<string, { type: 'special' | 'tiered' | 'flex'; prefix?: string; tiers?: string[] }> = {
  'CXA 580': { type: 'tiered', prefix: 'LIC-CXA-00580' },
  'CXA 780': { type: 'tiered', prefix: 'LIC-CXA-00780' },
  'CXA 3080': { type: 'tiered', prefix: 'LIC-CXA-03080' },
  'CXA 5080': { type: 'tiered', prefix: 'LIC-CXA-05080' },
  'CXA 7080-B010': { type: 'tiered', prefix: 'LIC-CXA-07080' },
  'CXA 7080-B020': { type: 'tiered', prefix: 'LIC-CXA-07080' },
  'CXA 7080-B030': { type: 'tiered', prefix: 'LIC-CXA-07080' },
  '2090': { type: 'flex' },
  '4090': { type: 'flex' },
  '6090': { type: 'flex' },
  '8090': { type: 'flex' },
};

export const SAAS_AZURE_REGIONS = ['East US', 'West US', 'North Europe', 'West Europe'];
export const SAAS_SKU_PREFIX = 'SHSAASACC-SUB-APPUNITS';
