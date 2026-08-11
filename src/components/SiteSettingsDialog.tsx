import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SiteConfig, LicenseType, SteelHeadModel, PricingItem } from '../types';
import { SAAS_AZURE_REGIONS, SAAS_SKU_PREFIX, AT_SERIES, SERIES_90, LICENSE_MAPPINGS } from '../constants';
import { AnimatedGradientBorder } from './AnimatedGradientBorder';

const SUPPORTED_MODELS_FOR_NIC = ['CXA 3080', 'CXA 5080', 'CXA 7080-B010', 'CXA 7080-B020', 'CXA 7080-B030', '4090', '6090', '8090'];

const NIC_OPTIONS = [
  { partNumber: 'NIC-1-001G-4TX-BP-C', description: '4-port 1G-Copper NIC' },
  { partNumber: 'NIC-1-001G-4SX-BP-C', description: '4-port 1G-Fiber NIC' },
  { partNumber: 'NIC-1-010G-4SR-BP-C', description: '4-port 10G-Fiber NIC - Short Reach' },
  { partNumber: 'NIC-1-010G-4LR-BP-C', description: '4-port 10G-Fiber NIC - Long Reach' },
  { partNumber: 'NIC-1-010G-4TX-BP-C', description: '4-port 10G-Copper NIC' },
];

interface SiteSettingsDialogProps {
  site: SiteConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: SiteConfig) => void;
  onRemove: (id: string) => void;
  availableSkus: string[];
  pricingData: PricingItem[];
}

export function SiteSettingsDialog({ site, isOpen, onClose, onSave, onRemove, availableSkus, pricingData }: SiteSettingsDialogProps) {
  const [config, setConfig] = useState<SiteConfig>({ 
    ...site,
    selectedSupportSku: site.selectedSupportSku || null
  });

  useEffect(() => {
    setConfig({ ...site });
  }, [site, isOpen]);

  const handleModelChange = (modelName: string) => {
    const model = [...AT_SERIES, ...SERIES_90].find((m) => m.name === modelName) || null;
    setConfig((prev) => ({ 
      ...prev, 
      selectedModel: model, 
      selectedLicense: null,
      selectedSupportSku: null,
      licenseTerm: null,
      selectedNicSku: null,
      selectedNicQty: 0
    }));
  };

  const getAvailableLicenses = () => {
    if (!config.selectedModel) return [];
    
    if (config.licenseType === LicenseType.FLEX) {
      const flexLicenses = pricingData.filter(item => item.partNumber.toLowerCase().startsWith('sub-acc-flex'));
      const modelName = config.selectedModel.name;

      let allowedSkus: string[] = [];
      if (modelName === '2090') {
        allowedSkus = ['SUB-ACC-FLEX-00025', 'SUB-ACC-FLEX-00050', 'SUB-ACC-FLEX-00100', 'SUB-ACC-FLEX-00200'];
      } else if (modelName === '4090') {
        allowedSkus = ['SUB-ACC-FLEX-00025', 'SUB-ACC-FLEX-00050', 'SUB-ACC-FLEX-00100', 'SUB-ACC-FLEX-00200', 'SUB-ACC-FLEX-00400', 'SUB-ACC-FLEX-00500'];
      } else if (modelName === '6090') {
        allowedSkus = ['SUB-ACC-FLEX-00025', 'SUB-ACC-FLEX-00050', 'SUB-ACC-FLEX-00100', 'SUB-ACC-FLEX-00200', 'SUB-ACC-FLEX-00400', 'SUB-ACC-FLEX-00500', 'SUB-ACC-FLEX-00750', 'SUB-ACC-FLEX-01000', 'SUB-ACC-FLEX-02000'];
      } else if (modelName === '8090') {
        allowedSkus = [
          'SUB-ACC-FLEX-00025', 'SUB-ACC-FLEX-00050', 'SUB-ACC-FLEX-00100', 'SUB-ACC-FLEX-00200', 'SUB-ACC-FLEX-00400', 'SUB-ACC-FLEX-00500',
          'SUB-ACC-FLEX-00750', 'SUB-ACC-FLEX-01000', 'SUB-ACC-FLEX-02000', 'SUB-ACC-FLEX-03000', 'SUB-ACC-FLEX-05000', 'SUB-ACC-FLEX-06000'
        ];
      } else if (modelName === 'CXA 580') {
        allowedSkus = ['SUB-ACC-FLEX-00025', 'SUB-ACC-FLEX-00050', 'SUB-ACC-FLEX-00100'];
      } else if (modelName === 'CXA 780') {
        allowedSkus = ['SUB-ACC-FLEX-00025', 'SUB-ACC-FLEX-00050', 'SUB-ACC-FLEX-00100', 'SUB-ACC-FLEX-00200'];
      } else if (modelName === 'CXA 3080') {
        allowedSkus = ['SUB-ACC-FLEX-00025', 'SUB-ACC-FLEX-00050', 'SUB-ACC-FLEX-00100', 'SUB-ACC-FLEX-00200', 'SUB-ACC-FLEX-00400'];
      } else if (modelName === 'CXA 5080') {
        allowedSkus = ['SUB-ACC-FLEX-00025', 'SUB-ACC-FLEX-00050', 'SUB-ACC-FLEX-00100', 'SUB-ACC-FLEX-00200', 'SUB-ACC-FLEX-00400', 'SUB-ACC-FLEX-00500', 'SUB-ACC-FLEX-00750'];
      } else if (modelName === 'CXA 7080-B010') {
        allowedSkus = ['SUB-ACC-FLEX-00025', 'SUB-ACC-FLEX-00050', 'SUB-ACC-FLEX-00100', 'SUB-ACC-FLEX-00200', 'SUB-ACC-FLEX-00400', 'SUB-ACC-FLEX-00500', 'SUB-ACC-FLEX-00750', 'SUB-ACC-FLEX-01000'];
      } else if (modelName === 'CXA 7080-B020') {
        allowedSkus = ['SUB-ACC-FLEX-00025', 'SUB-ACC-FLEX-00050', 'SUB-ACC-FLEX-00100', 'SUB-ACC-FLEX-00200', 'SUB-ACC-FLEX-00400', 'SUB-ACC-FLEX-00500', 'SUB-ACC-FLEX-00750', 'SUB-ACC-FLEX-01000', 'SUB-ACC-FLEX-02000'];
      } else if (modelName === 'CXA 7080-B030') {
        allowedSkus = ['SUB-ACC-FLEX-00025', 'SUB-ACC-FLEX-00050', 'SUB-ACC-FLEX-00100', 'SUB-ACC-FLEX-00200', 'SUB-ACC-FLEX-00400', 'SUB-ACC-FLEX-00500', 'SUB-ACC-FLEX-00750', 'SUB-ACC-FLEX-01000', 'SUB-ACC-FLEX-02000', 'SUB-ACC-FLEX-03000'];
      }

      return flexLicenses
        .filter(item => allowedSkus.length === 0 || allowedSkus.includes(item.partNumber.toUpperCase()))
        .sort((a, b) => a.partNumber.localeCompare(b.partNumber));
    }

    const mapping = LICENSE_MAPPINGS[config.selectedModel.name];
    if (!mapping) return [];

    if (mapping.type === 'tiered') {
      return [`${mapping.prefix}-T1`, `${mapping.prefix}-T2`, `${mapping.prefix}-T3`]
        .map(sku => pricingData.find(p => p.partNumber === sku))
        .filter((item): item is PricingItem => !!item);
    }

    if (mapping.type === 'special') {
      return (mapping.tiers || [])
        .map(sku => pricingData.find(p => p.partNumber === sku))
        .filter((item): item is PricingItem => !!item);
    }

    return [];
  };

  const getAvailableSupport = () => {
    if (!config.selectedModel || !config.selectedLicense) return [];

    const series = config.selectedModel.series;
    const supportSkuIds = series === '90' ? ['MNT-SH-90'] : ['MNT-SH-80', 'MNT-SH-90'];
    
    // Find a match based on the selected license SKU
    const selectedLicenseSku = config.selectedLicense?.trim().toUpperCase() || '';

    // Return support items matching that SKU ID and whose accountType or serviceLevel matches the selected License SKU
    const normalize = (s: string) => s.replace(/[-\s]/g, '').toUpperCase();
    
    const currentModelName = config.selectedModel.name;
    const normalizedModelName = normalize(currentModelName);
    const normalizedModelSku = normalize(config.selectedModel.skuPrefix);

    const matches = pricingData.filter(p => {
      const isSupportSku = supportSkuIds.includes(p.partNumber.trim().toUpperCase());
      if (!isSupportSku) return false;

      const accType = (p.accountType?.trim().toUpperCase() || '');
      const svcLevel = (p.serviceLevel?.trim().toUpperCase() || '');
      const normAccType = normalize(accType);
      const normSvcLevel = normalize(svcLevel);
      
      const desc = p.description.toUpperCase();
      const allModelNames = [...AT_SERIES, ...SERIES_90].map(m => m.name.toUpperCase());

      // Precise matching logic:
      const normalizedLicense = normalize(selectedLicenseSku);
      const is80Series = config.selectedModel?.series === '80';

      // 1. License Match:
      // Handle prefix variations (e.g. LIC-CXA-00580-T1 vs CXA-00580-T1)
      const licenseNoPrefix = selectedLicenseSku.startsWith('LIC-') ? selectedLicenseSku.substring(4) : selectedLicenseSku;
      const normalizedNoPrefix = normalize(licenseNoPrefix);

      const licenseMatch = 
        accType === selectedLicenseSku || 
        svcLevel === selectedLicenseSku ||
        accType === licenseNoPrefix ||
        svcLevel === licenseNoPrefix ||
        normAccType === normalizedLicense ||
        normSvcLevel === normalizedLicense ||
        normAccType === normalizedNoPrefix ||
        normSvcLevel === normalizedNoPrefix ||
        selectedLicenseSku.includes(accType) ||
        selectedLicenseSku.includes(svcLevel) ||
        licenseNoPrefix.includes(accType) ||
        licenseNoPrefix.includes(svcLevel);

      // 2. Model Validation & Constraints:
      // Ensure the support option doesn't belong to a DIFFERENT model in the same series.
      const modelNumber = currentModelName.replace(/[^0-9]/g, ''); // e.g. "580"
      
      const mentionsOtherModel = allModelNames.some(name => {
         if (name === currentModelName.toUpperCase()) return false;
         const otherModelNumber = name.replace(/[^0-9]/g, '');
         if (otherModelNumber === modelNumber) return false; // same series sub-model?
         
         const normName = normalize(name);
         // Guard: If it explicitly mentions "780" when we are "580", exclude it.
         const metadataMentionsOther = (accType.includes(otherModelNumber) && otherModelNumber !== '') || 
                                       (svcLevel.includes(otherModelNumber) && otherModelNumber !== '');
         const descMentionsOther = desc.includes(otherModelNumber) && otherModelNumber !== '';
         
         return metadataMentionsOther || descMentionsOther;
      });

      // Confirm it actually belongs to OUR model
      const modelMatch = 
        desc.includes(currentModelName.toUpperCase()) || 
        desc.includes(modelNumber) ||
        normAccType.includes(modelNumber) ||
        normSvcLevel.includes(modelNumber) ||
        normalizedModelSku.includes(modelNumber);

      // Final match criteria:
      return licenseMatch && modelMatch && !mentionsOtherModel;
    });

    // Fallback if strict matching finds nothing - less strict on license but keep model strict
    if (matches.length === 0) {
      const modelNumber = currentModelName.replace(/[^0-9]/g, '');
      
      return pricingData.filter(p => {
        const isSupportSku = supportSkuIds.includes(p.partNumber.trim().toUpperCase());
        if (!isSupportSku) return false;

        const accType = (p.accountType?.trim().toUpperCase() || '');
        const svcLevel = (p.serviceLevel?.trim().toUpperCase() || '');
        const normAccType = normalize(accType);
        const normSvcLevel = normalize(svcLevel);
        const desc = p.description.toUpperCase();
        const allModelNames = [...AT_SERIES, ...SERIES_90].map(m => m.name.toUpperCase());

        const mentionsOtherModel = allModelNames.some(name => {
           if (name === currentModelName.toUpperCase()) return false;
           const otherModelNumber = name.replace(/[^0-9]/g, '');
           if (otherModelNumber === modelNumber) return false;
           
           const normName = normalize(name);
           const metadataMentionsOther = (accType.includes(otherModelNumber) && otherModelNumber !== '') || 
                                         (svcLevel.includes(otherModelNumber) && otherModelNumber !== '');
           const descMentionsOther = desc.includes(otherModelNumber) && otherModelNumber !== '';
           
           return metadataMentionsOther || descMentionsOther;
        });

        const modelMatch = 
          desc.includes(currentModelName.toUpperCase()) || 
          desc.includes(modelNumber) ||
          normAccType.includes(modelNumber) ||
          normSvcLevel.includes(modelNumber) ||
          normalizedModelSku.includes(modelNumber);

        return modelMatch && !mentionsOtherModel;
      });
    }

    return matches;
  };

  const licenses = getAvailableLicenses();
  const supportOptions = getAvailableSupport();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-black italic uppercase tracking-tight pr-8">
            <span className="text-brand-gradient">{config.name}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-6 font-sans">
          {!config.isSaas && (
            <>
              <AnimatedGradientBorder className="w-full">
                <div className="grid gap-2 p-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Appliance Model</Label>
                  <Select onValueChange={handleModelChange} value={config.selectedModel?.name || ''}>
                    <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 focus:ring-primary shadow-sm">
                      <SelectValue placeholder="Select a Hardware Platform">
                        {config.selectedModel ? `${config.selectedModel.skuPrefix} (${config.selectedModel.name})` : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-2xl">
                      <div className="px-2 py-1.5 text-[9px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 dark:bg-slate-800/50">80 Series (AT)</div>
                      {AT_SERIES.map((m) => (
                        <SelectItem key={m.name} value={m.name} className="py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold">{m.skuPrefix}</span>
                            <span className="text-[9px] text-slate-400 font-mono italic">{m.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-[9px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 dark:bg-slate-800/50 mt-2">90 Series</div>
                      {SERIES_90.map((m) => (
                        <SelectItem key={m.name} value={m.name} className="py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold">{m.skuPrefix}</span>
                            <span className="text-[9px] text-slate-400 font-mono italic">{m.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AnimatedGradientBorder>

              <AnimatedGradientBorder className="w-full">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-800">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">License Model</Label>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-[10px] font-bold transition-all", config.licenseType === LicenseType.PERPETUAL ? "text-slate-900 dark:text-white" : "text-slate-400")}>Perpetual</span>
                    <Switch
                      checked={config.licenseType === LicenseType.FLEX}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, licenseType: checked ? LicenseType.FLEX : LicenseType.PERPETUAL, selectedLicense: null, selectedSupportSku: null, licenseTerm: null }))}
                      className="data-[state=checked]:bg-primary"
                    />
                    <span className={cn("text-[10px] font-bold transition-all", config.licenseType === LicenseType.FLEX ? "text-primary" : "text-slate-400")}>Flex / Sub</span>
                  </div>
                </div>
              </AnimatedGradientBorder>

              <AnimatedGradientBorder className="w-full">
                <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl flex items-center justify-between border border-amber-200/50 dark:border-amber-800/30">
                  <div className="flex flex-col gap-0.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">Deployment Mode</Label>
                    <p className="text-[9px] text-amber-600/60 dark:text-amber-500/60 font-medium">HA doubles qty for appliance, license & support.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-[10px] font-black transition-all uppercase tracking-tighter", !config.isHA ? "text-amber-700 dark:text-amber-400" : "text-amber-600/30")}>Non-HA</span>
                    <Switch
                      checked={config.isHA}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isHA: checked }))}
                      className="data-[state=checked]:bg-amber-500"
                    />
                    <span className={cn("text-[10px] font-black transition-all uppercase tracking-tighter", config.isHA ? "text-amber-700 dark:text-amber-400" : "text-amber-600/30")}>HA Mode</span>
                  </div>
                </div>
              </AnimatedGradientBorder>
            </>
          )}

          {config.isSaas ? (
            <>
              {/* Azure Region */}
              <AnimatedGradientBorder className="w-full">
                <div className="grid gap-2 p-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Azure Region</Label>
                  <Select onValueChange={(v) => setConfig(prev => ({...prev, azureRegion: v}))} value={config.azureRegion || ''}>
                    <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 focus:ring-primary shadow-sm">
                      <SelectValue placeholder="Select Azure Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {SAAS_AZURE_REGIONS.map(reg => <SelectItem key={reg} value={reg}>{reg}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </AnimatedGradientBorder>

              {/* User Count */}
              <AnimatedGradientBorder className="w-full">
                <div className="grid gap-2 p-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">No. of O365 Users</Label>
                  <input
                    type="number"
                    value={config.o365UserCount || ''}
                    onChange={(e) => setConfig(prev => ({...prev, o365UserCount: parseInt(e.target.value) || 0}))}
                    className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 focus:ring-primary shadow-sm p-4 text-sm font-bold"
                    placeholder="Enter user count"
                  />
                </div>
              </AnimatedGradientBorder>

              {/* Term */}
              <AnimatedGradientBorder className="w-full">
                <div className="grid gap-2 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subscription Term</Label>
                  <Select onValueChange={(v: '1yr' | '3yr' | '5yr') => setConfig(prev => ({ ...prev, saasTerm: v }))} value={config.saasTerm || ''}>
                    <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 focus:ring-primary shadow-sm">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-2xl">
                      <SelectItem value="1yr">1 Yr</SelectItem>
                      <SelectItem value="3yr">3 Yrs</SelectItem>
                      <SelectItem value="5yr">5 Yrs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AnimatedGradientBorder>

              {/* SKU selection */}
              <AnimatedGradientBorder className="w-full">
                <div className="grid gap-2 p-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">App Units SKU</Label>
                  <Select onValueChange={(v) => setConfig(prev => ({ ...prev, selectedSaasSku: v }))} value={config.selectedSaasSku || ''}>
                    <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 focus:ring-primary shadow-sm">
                      <SelectValue placeholder="Select SKU" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-2xl">
                      {pricingData
                        .filter(p => p.partNumber.startsWith(SAAS_SKU_PREFIX))
                        .map((l, idx) => (
                          <SelectItem key={`${l.partNumber}-${idx}`} value={l.partNumber} className="py-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-black">{l.partNumber}</span>
                              <span className="text-[10px] text-slate-500 truncate max-w-[300px] font-medium">
                                {(() => {
                                    const min = parseInt(l.haBundleEnabled || '');
                                    const max = parseInt(l.dynamicPriceFactor || '');
                                    if (!isNaN(min) && !isNaN(max)) {
                                      return `${min} | ${max} | (for ${min / 10} - ${max / 10} Users)`;
                                    }
                                    return `${l.haBundleEnabled || 'N/A'} | ${l.dynamicPriceFactor || 'N/A'}`;
                                  })()}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </AnimatedGradientBorder>
            </>
          ) : (
            <>
              {config.selectedModel && (
                <AnimatedGradientBorder className="w-full">
                  <div className="grid gap-2 p-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Software License</Label>
                    <Select onValueChange={(v) => setConfig(prev => ({ ...prev, selectedLicense: v, selectedSupportSku: null }))} value={config.selectedLicense || ''}>
                      <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 focus:ring-primary shadow-sm">
                        <SelectValue placeholder="Identify License Tier" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-2xl">
                        {licenses.map((l) => (
                          <SelectItem key={l.partNumber} value={l.partNumber} className="py-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-black">{l.partNumber}</span>
                              <span className="text-[10px] text-slate-500 truncate max-w-[300px] font-medium">{l.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </AnimatedGradientBorder>
              )}
              {config.selectedModel && SUPPORTED_MODELS_FOR_NIC.includes(config.selectedModel.name) && (
                <>
                <AnimatedGradientBorder className="w-full">
                  <div className="grid gap-2 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">NIC Card 1</Label>
                    <div className="flex gap-2">
                      <Select onValueChange={(v) => setConfig(prev => ({ ...prev, selectedNicSku: v, selectedNicQty: prev.selectedNicQty || 1 }))} value={config.selectedNicSku || ''}>
                        <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 focus:ring-primary shadow-sm hover:scale-[1.01] transition-all">
                          <SelectValue placeholder="Select NIC Card" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-2xl min-w-[400px]">
                          {NIC_OPTIONS.map((nic) => {
                            const pricing = pricingData.find(p => p.partNumber === nic.partNumber);
                            const price = pricing ? `$${pricing.listPrice.toLocaleString()}` : 'N/A';
                            return (
                              <SelectItem key={nic.partNumber} value={nic.partNumber} className="py-3">
                                <span className="font-bold">{nic.partNumber}</span> | <span className="text-slate-500 text-xs">({nic.description} | {price})</span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <input
                        type="number"
                        min="1"
                        value={config.selectedNicQty || 1}
                        onChange={(e) => setConfig(prev => ({ ...prev, selectedNicQty: parseInt(e.target.value) || 1 }))}
                        className="w-20 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 focus:ring-primary shadow-sm p-4 text-sm font-bold"
                        placeholder="Qty"
                      />
                    </div>
                  </div>
                </AnimatedGradientBorder>
                <AnimatedGradientBorder className="w-full">
                  <div className="grid gap-2 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">NIC Card 2</Label>
                    <div className="flex gap-2">
                      <Select onValueChange={(v) => setConfig(prev => ({ ...prev, selectedNicSku2: v, selectedNicQty2: prev.selectedNicQty2 || 1 }))} value={config.selectedNicSku2 || ''}>
                        <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 focus:ring-primary shadow-sm hover:scale-[1.01] transition-all">
                          <SelectValue placeholder="Select NIC Card" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-2xl min-w-[400px]">
                          {NIC_OPTIONS.map((nic) => {
                            const pricing = pricingData.find(p => p.partNumber === nic.partNumber);
                            const price = pricing ? `$${pricing.listPrice.toLocaleString()}` : 'N/A';
                            return (
                              <SelectItem key={nic.partNumber} value={nic.partNumber} className="py-3">
                                <span className="font-bold">{nic.partNumber}</span> | <span className="text-slate-500 text-xs">({nic.description} | {price})</span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <input
                        type="number"
                        min="1"
                        value={config.selectedNicQty2 || 1}
                        onChange={(e) => setConfig(prev => ({ ...prev, selectedNicQty2: parseInt(e.target.value) || 1 }))}
                        className="w-20 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 focus:ring-primary shadow-sm p-4 text-sm font-bold"
                        placeholder="Qty"
                      />
                    </div>
                  </div>
                </AnimatedGradientBorder>
                </>
              )}
              {config.selectedModel && config.licenseType === LicenseType.FLEX && (
                <AnimatedGradientBorder className="w-full">
                  <div className="grid gap-2 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">License Term</Label>
                    <Select onValueChange={(v: '1yr' | '3yr' | '5yr') => setConfig(prev => ({ ...prev, licenseTerm: v }))} value={config.licenseTerm || ''}>
                      <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 focus:ring-primary shadow-sm">
                        <SelectValue placeholder="Select license term" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-2xl">
                        <SelectItem value="1yr">1 Yr</SelectItem>
                        <SelectItem value="3yr">3 Yrs</SelectItem>
                        <SelectItem value="5yr">5 Yrs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AnimatedGradientBorder>
              )}
            </>
          )}

          {!config.isSaas && config.selectedLicense && (
            <AnimatedGradientBorder className="w-full">
              <div className="grid gap-2 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support Maintenance</Label>
                  {config.selectedSupportSku && (
                    <span className="text-[9px] font-mono font-black py-0.5 px-2 bg-indigo-500/10 text-indigo-500 rounded border border-indigo-500/20">
                      {config.selectedSupportSku.split('|')[0]}
                    </span>
                  )}
                </div>
                <Select onValueChange={(v) => setConfig(prev => ({ ...prev, selectedSupportSku: v }))} value={config.selectedSupportSku || ''}>
                  <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 focus:ring-primary shadow-sm">
                    <SelectValue placeholder="Select Support Plan" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-2xl">
                    {supportOptions.length === 0 ? (
                      <div className="p-4 text-center text-[10px] text-slate-400 font-bold italic">No matching support plans found for this account type.</div>
                    ) : (
                      supportOptions.map((opt, idx) => (
                        <SelectItem key={`${opt.partNumber}-${opt.description}-${idx}`} value={`${opt.partNumber}|${opt.description}`} className="py-3">
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-tight">
                                {opt.partNumber}
                              </span>
                              <span className="text-slate-200 dark:text-slate-700">|</span>
                              <span className="font-bold text-indigo-500 dark:text-indigo-400">{opt.accountType || 'N/A'}</span>
                              <span className="text-slate-200 dark:text-slate-700">|</span>
                              <span className={cn(
                                "font-black truncate max-w-[120px] uppercase tracking-tighter text-[10px]",
                                (opt.serviceLevel || '').toUpperCase().includes('NON GOV') ? "text-emerald-500" : 
                                (opt.serviceLevel || '').toUpperCase().includes('GOV') ? "text-rose-500" : "text-slate-400"
                              )}>
                                {opt.serviceLevel || 'STANDARD'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5 border-t border-slate-50 pt-1 mt-0.5">
                              <span className="text-[10px] text-slate-500 font-medium leading-tight line-clamp-1">{opt.description}</span>
                              <span className="text-[11px] font-mono font-black text-primary">${opt.listPrice.toLocaleString()}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </AnimatedGradientBorder>
          )}

          {!config.isSaas && config.selectedSupportSku && (
            <AnimatedGradientBorder className="w-full">
              <div className="grid gap-2 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support Term</Label>
                <Select onValueChange={(v: '1yr' | '3yr' | '5yr') => setConfig(prev => ({ ...prev, supportTerm: v }))} value={config.supportTerm || ''}>
                  <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 focus:ring-primary shadow-sm">
                    <SelectValue placeholder="Select support term" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-2xl">
                    <SelectItem value="1yr">1 Yr</SelectItem>
                    <SelectItem value="3yr">3 Yrs</SelectItem>
                    <SelectItem value="5yr">5 Yrs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AnimatedGradientBorder>
          )}
        </div>
        <DialogFooter className="bg-slate-50 dark:bg-slate-800/40 p-6 -mx-6 -mb-6 rounded-b-3xl flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={() => onRemove(site.id)}
            className="flex-none w-14 h-14 border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 rounded-2xl transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
          <Button onClick={() => onSave(config)} className="flex-1 h-14 bg-brand-gradient hover:opacity-90 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 border-none transition-all active:scale-95">
            Commit Site Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
