import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Home, BarChart2, DollarSign, Archive, FileText, Users, Settings, Truck, HardHat, Package, FlaskConical, BookOpen, ShieldCheck, GitBranch, ClipboardList, Bot, FileSignature, ScrollText, X, AlertCircle, GraduationCap, TrendingUp, Wrench, LogOut, User, RotateCcw, Ruler, Droplets, Globe2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { PUBLIC_BRAND_LOGO } from '@/lib/appBranding';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const navGroups = [
  {
    label: 'Ana Paneller',
    items: [
      { id: 'dashboard', icon: Home, label: 'Ana Panel' },
      { id: 'kpi', icon: BarChart2, label: 'KPI Modülü' },
    ]
  },
  {
    label: 'Kalite Yönetimi',
    items: [
      { id: 'nonconformity', icon: ClipboardList, label: 'Uygunsuzluk Yönetimi' },
      { id: 'df-8d', icon: FileText, label: 'DF ve 8D Yönetimi' },
      { id: 'quality-cost', icon: DollarSign, label: 'Kalite Maliyetleri' },
      { id: 'customer-complaints', icon: AlertCircle, label: 'Satış Sonrası Hizmetler' },
    ]
  },
  {
    label: 'Girdi ve Üretim Kalite',
    items: [
      { id: 'incoming-quality', icon: Package, label: 'Girdi Kalite Kontrol' },
      { id: 'process-control', icon: Wrench, label: 'Proses Kontrol Yönetimi' },
      { id: 'produced-vehicles', icon: Truck, label: 'Üretilen Araçlar' },
      { id: 'leak-test', icon: Droplets, label: 'Sızdırmazlık Kontrol' },
      { id: 'dynamic-balance', icon: RotateCcw, label: 'Dinamik Balans Kontrol' },
      { id: 'fixture', icon: Ruler, label: 'Fikstür Takip' },
    ]
  },
  {
    label: 'Tedarikçi Yönetimi',
    items: [
      { id: 'supplier-quality', icon: Users, label: 'Tedarikçi Kalite' },
    ]
  },
  {
    label: 'Denetim ve Uyumluluk',
    items: [
      { id: 'internal-audit', icon: HardHat, label: 'İç Tetkik Yönetimi' },
      { id: 'deviation', icon: GitBranch, label: 'Sapma Yönetimi' },
      { id: 'audit-logs', icon: ScrollText, label: 'Denetim Kayıtları' },
    ]
  },
  {
    label: 'Ekipman ve Dokümantasyon',
    items: [
      { id: 'equipment', icon: FlaskConical, label: 'Ekipman & Kalibrasyon' },
      { id: 'document', icon: BookOpen, label: 'İç Kaynaklı Doküman Yönetimi' },
      { id: 'external-docs', icon: Globe2, label: 'Dış Kaynak Dokümanları' },
      { id: 'wps', icon: FileSignature, label: 'WPS Yönetimi' },
    ]
  },
  {
    label: 'İyileştirme ve Eğitim',
    items: [
      { id: 'kaizen', icon: Bot, label: 'İyileştirme (Kaizen)' },
      { id: 'training', icon: ShieldCheck, label: 'Eğitim Yönetimi' },
      { id: 'polyvalence', icon: GraduationCap, label: 'Polivalans Matrisi' },
      { id: 'benchmark', icon: TrendingUp, label: 'Benchmark Yönetimi' },
    ]
  },
  {
    label: 'Operasyonel',
    items: [
      { id: 'quarantine', icon: Archive, label: 'Karantina Yönetimi' },
      { id: 'tasks', icon: ClipboardList, label: 'Görev Yönetimi' },
    ]
  },
  {
    label: 'Sistem',
    items: [
      { id: 'settings', icon: Settings, label: 'Ayarlar' },
    ]
  },
];

const Sidebar = ({
  activeModule,
  setActiveModule,
  permittedModules,
  setSidebarOpen,
  moduleTitles
}) => {
  const {
    user,
    signOut
  } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const activeSidebarTitle = useMemo(() => {
    if (!activeModule) return null;
    for (const group of navGroups) {
      const item = group.items.find((i) => i.id === activeModule);
      if (item) return item.label;
    }
    return moduleTitles?.[activeModule] ?? null;
  }, [activeModule, moduleTitles]);

  const handleItemClick = (itemId) => {
    setActiveModule(itemId);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground border-r border-border/60">
      <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-border/60 shrink-0" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <img
              src={PUBLIC_BRAND_LOGO}
              alt="Telefoncular"
              className="h-7 sm:h-8 w-auto max-w-full object-contain object-left"
              width={220}
              height={32}
              decoding="async"
            />
            <div className="min-w-0">
              <span className="sr-only">Telefoncular QMS</span>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Kalite Yönetim Sistemi</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 shrink-0 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Menüyü kapat</span>
          </Button>
        </div>
        {activeModule && activeSidebarTitle && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0"></div>
            <p className="text-xs sm:text-sm font-semibold text-primary truncate flex-1">
              {activeSidebarTitle}
            </p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {navGroups.map((group, groupIndex) => {
            const hasPermittedItems = group.items.some(item => permittedModules.includes(item.id));

            if (!hasPermittedItems) return null;

            return (
              <div key={group.label}>
                {groupIndex > 0 && <Separator className="my-2" />}
                <div className="px-3 py-2">
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {group.label}
                  </p>
                </div>
                <div className="space-y-0.5">
                  {group.items
                    .filter(item => permittedModules.includes(item.id))
                    .map(item => (
                      <motion.button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm font-semibold transition-all touch-manipulation ${activeModule === item.id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-accent hover:text-accent-foreground active:bg-accent text-foreground/70'
                          }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <item.icon className="mr-2.5 sm:mr-3 h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </motion.button>
                    ))}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-3 sm:p-4 border-t border-border/60 shrink-0" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xs sm:text-sm min-w-0 flex-1">
            <p className="font-semibold truncate">{user?.user_metadata?.full_name || 'Kullanıcı'}</p>
            <p className="text-muted-foreground truncate text-[10px] sm:text-xs">{user?.email}</p>
          </div>
        </div>
        <Button onClick={handleSignOut} variant="outline" className="w-full h-9 sm:h-10 text-xs sm:text-sm rounded-lg">
          <LogOut className="h-4 w-4 mr-2" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
