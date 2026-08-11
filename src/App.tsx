/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Settings, Upload, FileText, ChevronRight, CheckCircle2, Download } from 'lucide-react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';
import { SiteConfig, LicenseType, PricingItem } from './types.ts';
import { SiteSettingsDialog } from './components/SiteSettingsDialog.tsx';
import { AnimatedGradientBorder } from './components/AnimatedGradientBorder.tsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function App() {
  const [sites, setSites] = useState<SiteConfig[]>([
    { id: '1', name: 'Primary Hub', bandwidth: 500, selectedModel: null, licenseType: LicenseType.FLEX, selectedLicense: null, isHA: false }
  ]);
  const [pricingData, setPricingData] = useState<PricingItem[]>([]);
  const [availableSkus, setAvailableSkus] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSites((items) => {
        const oldIndex = items.findIndex(s => s.id === active.id);
        const newIndex = items.findIndex(s => s.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        complete: (results) => {
          const rows = results.data as string[][];
          const items: PricingItem[] = [];
          const skus: string[] = [];
          
          const headerRow = rows.find(row => row.some(cell => {
            const val = String(cell).toUpperCase();
            return val.includes('PART NUMBER') || val.includes('SKU');
          }));
          if (!headerRow) return;

          const findIdx = (terms: string[]) => headerRow.findIndex(cell => 
            terms.some(term => String(cell).toUpperCase().includes(term))
          );

          const partNumberIdx = findIdx(['PART NUMBER', 'SKU', 'PN']);
          const descriptionIdx = findIdx(['DESCRIPTION', 'PRODUCT', 'INFO']);
          const listPriceIdx = findIdx(['LIST PRICE', 'PRICE', 'USD']);
          const uomIdx = findIdx(['UOM', 'UNIT', 'MEASURE']);
          const accountTypeIdx = findIdx(['ACCOUNT TYPE', 'ATTRIBUTE ACCOUNT TYPE', 'TYPE', 'CATEGORY', 'ACCOUNT']);
          const serviceLevelIdx = findIdx(['SERVICE LEVEL', 'SUPPORT LEVEL', 'SLA']);
          const haBundleEnabledIdx = findIdx(['HA BUNDLE ENABLED']);
          const dynamicPriceFactorIdx = findIdx(['DYNAMIC PRICE FACTOR']);

          const dataStartIdx = rows.indexOf(headerRow) + 1;
          const dataRows = rows.slice(dataStartIdx);
          
          dataRows.forEach(row => {
            const partNumber = row[partNumberIdx]?.trim();
            const description = row[descriptionIdx]?.trim();
            const priceStr = row[listPriceIdx]?.trim()?.replace(/[^0-9.]/g, '');
            const price = parseFloat(priceStr);
            const uom = row[uomIdx]?.trim() || 'Each';
            const accountType = accountTypeIdx !== -1 ? row[accountTypeIdx]?.trim() : undefined;
            const serviceLevel = serviceLevelIdx !== -1 ? row[serviceLevelIdx]?.trim() : undefined;
            const haBundleEnabled = haBundleEnabledIdx !== -1 ? row[haBundleEnabledIdx]?.trim() : undefined;
            const dynamicPriceFactor = dynamicPriceFactorIdx !== -1 ? row[dynamicPriceFactorIdx]?.trim() : undefined;

            if (partNumber && !isNaN(price)) {
              items.push({ partNumber, description, listPrice: price, uom, accountType, serviceLevel, haBundleEnabled, dynamicPriceFactor });
              skus.push(partNumber);
            }
          });
          setPricingData(items);
          setAvailableSkus(skus);
        },
        header: false,
        skipEmptyLines: true,
      });
    }
  };

  const addSite = () => {
    setSites([...sites, { 
      id: Date.now().toString(), 
      name: `Site ${sites.length + 1}`, 
      bandwidth: 100, 
      selectedModel: null, 
      licenseType: LicenseType.FLEX, 
      selectedLicense: null,
      isHA: false,
      selectedNicSku: null,
      selectedNicQty: 0
    }]);
  };

  const addSaasSite = () => {
    setSites([...sites, { 
      id: Date.now().toString(), 
      name: `SAAS Site ${sites.filter(s => s.isSaas).length + 1}`, 
      bandwidth: 0, 
      selectedModel: null, 
      licenseType: LicenseType.FLEX, 
      selectedLicense: null,
      isHA: false,
      isSaas: true,
      azureRegion: '',
      o365UserCount: 0,
      saasTerm: '1yr',
      selectedSaasSku: null
    }]);
  };

  const updateSite = (id: string, updates: Partial<SiteConfig>) => {
    setSites(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSite = (id: string) => {
    setSites(sites.filter(s => s.id !== id));
  };

  const getBOM = () => {
    const bom: any[] = [];
    sites.forEach(site => {
      const qty = site.isHA ? 2 : 1;
      if (site.isSaas && site.selectedSaasSku && site.o365UserCount && site.saasTerm) {
        const item = pricingData.find(p => p.partNumber === site.selectedSaasSku);
        const termMonths = site.saasTerm === '3yr' ? 36 : (site.saasTerm === '5yr' ? 60 : 12);
        
        bom.push({
          site: site.name,
          sku: site.selectedSaasSku,
          description: `SAAS App Units (${site.saasTerm}) - Region: ${site.azureRegion} - Users: ${site.o365UserCount}`,
          uom: 'Each',
          price: (item?.listPrice || 0) * (site.o365UserCount * 10),
          qty: termMonths
        });
      } else if (site.selectedModel) {
        const applianceSku = site.selectedModel.skuPrefix;
        const applianceItem = pricingData.find(p => p.partNumber === applianceSku);
        
        bom.push({
          site: site.name,
          sku: applianceSku,
          description: applianceItem?.description || site.selectedModel.name + ' Appliance Base',
          uom: applianceItem?.uom || 'Each',
          price: applianceItem?.listPrice || 0,
          qty: qty
        });

        if (site.selectedLicense) {
          const licenseItem = pricingData.find(p => p.partNumber === site.selectedLicense);
          const termFactor = site.licenseTerm === '3yr' ? 3 : (site.licenseTerm === '5yr' ? 5 : 1);
          bom.push({
            site: site.name,
            sku: site.selectedLicense,
            description: `${licenseItem?.description || site.licenseType + ' License Tier'} (${site.licenseTerm || '1yr'})`,
            uom: licenseItem?.uom || 'Month',
            price: licenseItem?.listPrice || 0,
            qty: qty * termFactor
          });
        }

        if (site.selectedSupportSku) {
          const parts = site.selectedSupportSku.split('|');
          const sku = parts[0];
          const desc = parts.slice(1).join('|');
          
          const supportItem = pricingData.find(p => 
            p.partNumber.trim().toUpperCase() === sku.trim().toUpperCase() && 
            p.description.trim() === desc.trim()
          );

          if (supportItem) {
            const termFactor = site.supportTerm === '3yr' ? 3 : (site.supportTerm === '5yr' ? 5 : 1);
            bom.push({
              site: site.name,
              sku: supportItem.partNumber,
              description: `${supportItem.description} (${site.supportTerm || '1yr'})`,
              uom: supportItem.uom,
              price: supportItem.listPrice,
              qty: qty * termFactor
            });
          }
        }
        if (site.selectedNicSku && site.selectedNicQty && site.selectedNicQty > 0) {
          const nicItem = pricingData.find(p => p.partNumber === site.selectedNicSku);
          bom.push({
            site: site.name,
            sku: site.selectedNicSku,
            description: nicItem?.description || 'NIC Card',
            uom: nicItem?.uom || 'Each',
            price: nicItem?.listPrice || 0,
            qty: qty * site.selectedNicQty
          });
        }
        if (site.selectedNicSku2 && site.selectedNicQty2 && site.selectedNicQty2 > 0) {
          const nicItem = pricingData.find(p => p.partNumber === site.selectedNicSku2);
          bom.push({
            site: site.name,
            sku: site.selectedNicSku2,
            description: nicItem?.description || 'NIC Card',
            uom: nicItem?.uom || 'Each',
            price: nicItem?.listPrice || 0,
            qty: qty * site.selectedNicQty2
          });
        }
      }
    });
    return bom;
  };

  const totalBOM = getBOM();
  const totalPrice = totalBOM.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const exportToCSV = () => {
    if (totalBOM.length === 0) return;
    
    const csvData = totalBOM.map((item, i) => ({
      'Line #': i + 1,
      'Site': item.site,
      'SKU / Part Number': item.sku,
      'Description': item.description,
      'UOM': item.uom,
      'Qty': item.qty,
      'Unit Price': item.price,
      'Total Price': item.price * item.qty
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Riverbed_BOM_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setSites([]);
    setPricingData([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (jsonInputRef.current) jsonInputRef.current.value = '';
  };

  const exportConfig = () => {
    const configData = {
      sites,
      fileName,
      pricingData,
      version: '1.0'
    };
    const jsonString = JSON.stringify(configData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Steelhead_BOM_Config_${new Date().toISOString().split('T')[0]}.json`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          
          let importedSites = null;
          let importedPricingData = null;
          let importedFileName = null;

          if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.sites)) {
              importedSites = parsed.sites;
            }
            if (Array.isArray(parsed.pricingData)) {
              importedPricingData = parsed.pricingData;
            }
            if (typeof parsed.fileName === 'string') {
              importedFileName = parsed.fileName;
            }
          }

          // If simple array is provided
          if (!importedSites && Array.isArray(parsed)) {
            importedSites = parsed;
          }

          if (importedSites && importedSites.length > 0) {
            // Check that sites have basic properties
            const isValid = importedSites.every((s: any) => s && typeof s === 'object' && s.id && typeof s.name === 'string');
            if (!isValid) {
              setJsonError('The imported JSON file contains invalid site configuration objects.');
              return;
            }

            setSites(importedSites);

            if (importedPricingData) {
              setPricingData(importedPricingData);
              setAvailableSkus(importedPricingData.map((p: any) => p.partNumber));
            }
            if (importedFileName) {
              setFileName(importedFileName);
            }
          } else {
            setJsonError('No valid site configurations found in the JSON file.');
          }
        } catch (err) {
          console.error(err);
          setJsonError('Could not read or parse the JSON file. Ensure it is a valid JSON configuration.');
        } finally {
          if (jsonInputRef.current) jsonInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 transition-colors duration-500 font-sans selection:bg-primary selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from)_0%,_transparent_25%)] from-primary/5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto p-4 md:p-8 relative">
        <nav className="flex justify-between items-center mb-12 px-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center skew-x-3 rotate-3 transform transition hover:rotate-0 hover:skew-x-0 cursor-pointer duration-300">
               <img 
                 src="https://www.riverbed.com/riverbed-wp-content/uploads/2023/10/RVBD_KO_Logo_696x696.png" 
                 alt="Riverbed Logo" 
                 className="w-10 h-10 object-contain -rotate-3"
               />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-orange-500 italic pr-2">Steelhead</span>
                <span className="text-slate-100"> BOM Builder</span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
                <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-[20px] border border-slate-800 shadow-xl flex items-center gap-6 backdrop-blur-xl h-24">
                   <div className="text-right">
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Value</div>
                     <div className="text-lg font-black text-brand-gradient">${totalPrice.toLocaleString()}</div>
                   </div>
                   <div className="w-px h-8 bg-slate-800" />
                   <div className="text-right">
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Items</div>
                     <div className="text-lg font-black text-white">{totalBOM.length}</div>
                   </div>
                </div>
            
            <div className="flex flex-col gap-2 min-w-[220px]">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "h-12 w-full px-6 rounded-2xl gap-2 font-bold shadow-2xl transition-all duration-300 active:scale-95 group border-none",
                  pricingData.length > 0 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20" 
                    : "bg-brand-gradient text-white shadow-primary/40"
                )}
              >
                <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                <span className="truncate max-w-[140px] text-left">{fileName || 'Upload Price List'}</span>
                {pricingData.length > 0 && <CheckCircle2 className="w-5 h-5 fill-white text-emerald-500 animate-in zoom-in spin-in-90 duration-500 shrink-0" />}
              </Button>
              
              <div className="flex gap-2">
                <input type="file" ref={jsonInputRef} onChange={handleJsonUpload} accept=".json" className="hidden" />
                <Button
                  onClick={exportConfig}
                  variant="outline"
                  className="h-10 px-3 rounded-xl flex-1 gap-1.5 flex items-center justify-center text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:text-primary hover:border-primary active:scale-95 transition-all duration-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Config</span>
                </Button>
                <Button
                  onClick={() => jsonInputRef.current?.click()}
                  variant="outline"
                  className="h-10 px-3 rounded-xl flex-1 gap-1.5 flex items-center justify-center text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:text-primary hover:border-primary active:scale-95 transition-all duration-200"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Config</span>
                </Button>
              </div>
              
              <Button
                onClick={() => setShowClearConfirm(true)}
                variant="outline"
                className="h-10 w-full rounded-xl gap-1.5 flex items-center justify-center text-xs font-bold border border-rose-200/50 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 active:scale-95 transition-all duration-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Config</span>
              </Button>
            </div>
          </div>
        </nav>

        <main className="space-y-12">
          {/* Sites Section (Top, Horizontal Grid) */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tight">
                <Settings className="text-royal w-5 h-5"/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-orange-500">Site Configuration</span>
              </h2>
            </div>
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={sites.map(s => s.id)} strategy={horizontalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sites.map((site) => (
                    <SortableSite key={site.id} site={site} updateSite={updateSite} removeSite={removeSite} setEditingSiteId={setEditingSiteId} />
                  ))}
                  
                  <motion.button 
                    layout
                    onClick={addSite}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-emerald-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-emerald-400 hover:text-white hover:border-emerald-400 hover:bg-emerald-900/20 transition-all duration-300 min-h-[140px]"
                  >
                    <Plus className="w-6 h-6"/> 
                    <span className="text-xs font-black tracking-widest uppercase">Add New Site</span>
                  </motion.button>
                  <motion.button 
                    layout
                    onClick={addSaasSite}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-indigo-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-indigo-400 hover:text-white hover:border-indigo-400 hover:bg-indigo-900/20 transition-all duration-300 min-h-[140px]"
                  >
                    <Plus className="w-6 h-6"/> 
                    <span className="text-xs font-black tracking-widest uppercase">Add New SAAS Site</span>
                  </motion.button>
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <div className="w-full">
            <AnimatedGradientBorder borderRadius="2.5rem" className="shadow-2xl">
              <Card className="border-none bg-white dark:bg-slate-900 rounded-[calc(2.5rem-1.5px)] overflow-hidden flex flex-col">
                <div className="p-8 md:p-10 flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                  <div>
                    <h3 className="text-2xl font-black italic tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-orange-500 uppercase pr-4">Full Bill of Materials</h3>
                    {fileName && <p className="text-xs text-primary font-bold mt-1 uppercase tracking-widest">Source: {fileName}</p>}
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowClearConfirm(true)}
                      className="flex-1 sm:flex-none rounded-xl border-slate-200 dark:border-slate-800 dark:text-white font-black uppercase text-[10px] tracking-widest h-12 px-6"
                    >
                      Clear Configuration
                    </Button>
                    <Button 
                      onClick={exportToCSV}
                      disabled={totalBOM.length === 0}
                      className="flex-1 sm:flex-none bg-brand-gradient hover:opacity-90 text-white font-black uppercase text-[10px] tracking-widest rounded-xl h-12 px-8 shadow-lg shadow-[#E9681D]/20 border-none"
                    >
                      <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                  </div>
                </div>
                
                {totalBOM.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 border-dashed">
                      <FileText className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-6 opacity-50" />
                      <p className="text-slate-400 font-bold mb-1 uppercase tracking-widest text-sm">BOM is Empty</p>
                      <p className="text-[10px] text-slate-400 max-w-xs text-center font-medium">Add sites and select equipment to populate this list.</p>
                    </div>
                ) : (
                  <div className="flex-1">
                    <div className="overflow-x-auto rounded-2xl border border-slate-50 dark:border-slate-800">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                          <TableRow className="hover:bg-transparent border-b border-slate-200 dark:border-slate-800">
                            <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-widest py-6 px-8">Line #</TableHead>
                            <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-widest py-6 px-8">SKU / PN</TableHead>
                            <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-widest py-6">Product Description</TableHead>
                            <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-widest py-6">UOM</TableHead>
                            <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-widest py-6 text-center">Qty</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase text-slate-500 tracking-widest py-6">Unit Price</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase text-royal tracking-widest py-6">Total</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase text-slate-500 tracking-widest py-6 px-8">Location</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {totalBOM.map((item, i) => (
                              <TableRow key={`${item.site}-${item.sku}-${i}`} className="border-b border-slate-100 dark:border-slate-800 transition-colors group">
                                <TableCell className="font-mono font-black text-sm py-6 px-8 whitespace-nowrap text-slate-400 dark:text-slate-500">{i + 1}</TableCell>
                                <TableCell className="font-mono font-black text-sm py-6 px-8 whitespace-nowrap text-slate-900 dark:text-white">{item.sku}</TableCell>
                                <TableCell className="text-[11px] text-slate-800 dark:text-slate-200 py-6 uppercase font-bold leading-relaxed whitespace-normal break-words">
                                  {item.description}
                                </TableCell>
                                <TableCell className="text-[10px] font-black text-slate-400 py-6 whitespace-nowrap uppercase italic tracking-tighter">{item.uom}</TableCell>
                                <TableCell className="text-center font-mono text-xs py-6 font-black text-royal dark:text-indigo-400">{item.qty}</TableCell>
                                <TableCell className="text-right font-mono text-sm py-6 text-slate-600 dark:text-slate-300 font-medium">${item.price.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono font-black text-slate-900 dark:text-white py-6 shadow-[inset_-4px_0_0_0_rgba(100,64,164,0.1)] group-hover:bg-royal/5 transition-all">${(item.price * item.qty).toLocaleString()}</TableCell>
                                <TableCell className="text-right py-6 px-8">
                                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-brand-gradient/20 group-hover:text-white text-[9px] font-black px-3 py-1.5 rounded-md uppercase tracking-widest border border-transparent group-hover:border-primary/30 transition-all font-mono">
                                    {item.site}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </AnimatedGradientBorder>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {editingSiteId && (
          <SiteSettingsDialog 
            site={sites.find(s => s.id === editingSiteId)!}
            isOpen={!!editingSiteId}
            onClose={() => setEditingSiteId(null)}
            onSave={(config) => {
              updateSite(editingSiteId, config);
              setEditingSiteId(null);
            }}
            onRemove={(id) => {
              removeSite(id);
              setEditingSiteId(null);
            }}
            availableSkus={availableSkus}
            pricingData={pricingData}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClearConfirm && (
          <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tight mb-2">
                  Clear <span className="text-rose-500">Configuration?</span>
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                  This will permanently delete all configured sites and clear the uploaded pricing data. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-8 flex flex-row gap-3 sm:justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 sm:flex-none h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-slate-200 dark:border-slate-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    clearAll();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 sm:flex-none h-12 px-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-500/20 shadow-xl border-none"
                >
                  Clear Everything
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {jsonError && (
          <Dialog open={!!jsonError} onOpenChange={(open) => !open && setJsonError(null)}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tight mb-2">
                  Import <span className="text-rose-500">Error</span>
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                  {jsonError}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-8 flex flex-row gap-3 sm:justify-end">
                <Button 
                  onClick={() => setJsonError(null)}
                  className="flex-1 sm:flex-none h-12 px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 font-black uppercase text-[10px] tracking-widest shadow-lg border-none"
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <footer className="max-w-7xl mx-auto p-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">
        SteelHead BOM Generator &bull; Designed for Efficiency
      </footer>
    </div>
  );
}

function SortableSite({ site, updateSite, removeSite, setEditingSiteId }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: site.id });
  const style = { transform: CSS.Transform.toString(transform), transition, cursor: 'grab' };

  return (
    <div ref={setNodeRef} style={style}>
        <AnimatedGradientBorder borderRadius="1rem" className="h-full shadow-lg">
          <Card className={cn("overflow-hidden border-none group relative h-full rounded-[calc(1rem-1.5px)]", site.isSaas ? "bg-slate-900 border border-indigo-900/50" : "bg-white dark:bg-slate-900")}>
            <div className={cn("absolute top-0 left-0 w-1.5 h-full transition-all duration-300 group-hover:w-2", site.isSaas ? "bg-indigo-500" : "bg-emerald-500")} />
            
            <div className="absolute top-2 right-2 z-10 cursor-grab p-2 bg-slate-800/80 rounded-md hover:bg-slate-700 transition-colors" {...attributes} {...listeners}>
               <span className="text-[10px] text-white font-black tracking-widest">DRAG</span>
            </div>
            
            <div className="p-5 pt-8">
              {/* HA Status Badge */}
              <div className="absolute top-0 left-1.5">
                <div className={cn(
                  "text-[8px] font-black px-3 py-1 rounded-br-xl uppercase tracking-[0.1em] shadow-sm",
                  site.isHA 
                    ? "bg-amber-500 text-white" 
                    : site.isSaas ? "bg-indigo-600 text-white" : "bg-slate-600 text-white"
                )}>
                  {site.isHA ? 'HA (Qty 2)' : 'Non-HA (Qty 1)'}
                </div>
              </div>

              <div className="flex justify-between items-start mb-5">
                <div className="space-y-3 flex-1">
                  <input 
                    value={site.name} 
                    onChange={(e) => updateSite(site.id, { name: e.target.value })}
                    className={cn("w-full bg-transparent text-2xl font-black focus:outline-none focus:opacity-80 transition-all uppercase placeholder:opacity-30", site.isSaas ? "text-indigo-400" : "text-emerald-600 dark:text-emerald-400")}
                    placeholder="Site Name"
                  />
                  <div className="flex items-center gap-4">
                    {site.isSaas ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">O365 Users</span>
                        <div className="text-sm font-bold text-indigo-200">{site.o365UserCount || 0}</div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">WAN Bandwidth</span>
                        <div className="flex items-center gap-2">
                          <input 
                              type="number" 
                              value={site.bandwidth} 
                              onChange={(e) => updateSite(site.id, { bandwidth: parseInt(e.target.value) || 0 })}
                              className="w-28 bg-slate-100 dark:bg-slate-800 text-sm font-mono font-bold p-2 px-3 rounded-lg text-emerald-600 text-center border-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                          />
                          <span className="text-xs font-bold text-slate-500 italic">Mbps</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={(e) => { e.stopPropagation(); setEditingSiteId(site.id); }}
                    className={cn("rounded-lg w-8 h-8 border-slate-800 shadow-sm transition-all", site.isSaas ? "bg-slate-900 text-indigo-400 hover:text-indigo-200 hover:border-indigo-400" : "bg-white dark:bg-slate-900 hover:text-primary hover:border-primary")}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={(e) => { e.stopPropagation(); removeSite(site.id); }}
                    className={cn("rounded-lg w-8 h-8 border-slate-800 shadow-sm transition-all", site.isSaas ? "bg-slate-900 text-indigo-400 hover:text-rose-400 hover:border-rose-400" : "bg-white dark:bg-slate-900 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                    {site.isSaas ? (
                    <div className="flex flex-col gap-0.5 p-2 bg-indigo-950/20 rounded-xl border border-indigo-900/50 col-span-2">
                        <span className="text-xs font-black uppercase text-indigo-400">Azure Region</span>
                        <span className="text-[10px] font-bold truncate text-indigo-100">
                            {site.azureRegion || 'Not set'}
                        </span>
                    </div>
                    ) : (
                    <>
                        <div className="flex flex-col gap-0.5 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="text-xs font-black uppercase text-slate-400">Hardware</span>
                            <span className="text-[10px] font-bold truncate dark:text-white">
                            {site.selectedModel?.name || 'Unset'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-0.5 p-2 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
                            <span className="text-xs font-black uppercase text-slate-400">License</span>
                            <span className="text-[9px] font-bold truncate text-primary">
                            {site.selectedLicense || 'Unset'}
                            </span>
                        </div>
                    </>
                    )}
              </div>
              {!site.isSaas && (
                    <div className="w-full flex flex-col gap-0.5 p-2 bg-slate-50/30 dark:bg-slate-800/10 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-black uppercase text-slate-400">Support Maintenance</span>
                        <span className="text-[9px] font-bold truncate text-indigo-500 dark:text-indigo-400">
                        {site.selectedSupportSku ? site.selectedSupportSku.split('|')[0] : 'Not Configured'}
                        </span>
                    </div>
              )}
              {site.isSaas && (
                    <div className="w-full flex flex-col gap-0.5 p-2 bg-indigo-950/20 rounded-xl border border-indigo-900/50">
                        <span className="text-xs font-black uppercase text-indigo-400">Subscription Term</span>
                        <span className="text-[9px] font-bold truncate text-indigo-100">
                        {site.saasTerm || 'Not Configured'}
                        </span>
                    </div>
              )}
            </div>
          </Card>
        </AnimatedGradientBorder>
    </div>
  )
}

