/**
 * StatusBadge - Evrensel durum badge bileşeni
 * Tüm modüllerde tutarlı durum gösterimi sağlar.
 * Mevcut statusUtils.jsx'i BOZMAZ - ek olarak kullanılabilir.
 */
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { isAfter, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
    'Açık': { variant: 'secondary', className: '' },
    'Kapatıldı': { variant: 'default', className: 'bg-emerald-500/15 text-emerald-700 border-transparent hover:bg-emerald-500/25' },
    'Kapalı': { variant: 'default', className: 'bg-emerald-500/15 text-emerald-700 border-transparent hover:bg-emerald-500/25' },
    'Tamamlandı': { variant: 'default', className: 'bg-emerald-500/15 text-emerald-700 border-transparent hover:bg-emerald-500/25' },
    'İşlemde': { variant: 'default', className: 'bg-amber-500/15 text-amber-700 border-transparent hover:bg-amber-500/25' },
    'Devam Ediyor': { variant: 'default', className: 'bg-amber-500/15 text-amber-700 border-transparent hover:bg-amber-500/25' },
    'Onay Bekliyor': { variant: 'default', className: 'bg-purple-500/15 text-purple-700 border-transparent hover:bg-purple-500/25' },
    'Reddedildi': { variant: 'destructive', className: '' },
    'İptal': { variant: 'destructive', className: '' },
    'İptal Edildi': { variant: 'destructive', className: '' },
    'Gecikmiş': { variant: 'default', className: 'bg-red-500/15 text-red-700 border-transparent animate-pulse' },
    
    'Onaylı': { variant: 'default', className: 'bg-emerald-500/15 text-emerald-700 border-transparent' },
    'Koşullu Onaylı': { variant: 'default', className: 'bg-amber-500/15 text-amber-700 border-transparent' },
    'Askıya Alınmış': { variant: 'default', className: 'bg-orange-500/15 text-orange-700 border-transparent' },
    'Red': { variant: 'destructive', className: '' },
    
    'Uygun': { variant: 'default', className: 'bg-emerald-500/15 text-emerald-700 border-transparent' },
    'Uygun Değil': { variant: 'destructive', className: '' },
    'Koşullu Kabul': { variant: 'default', className: 'bg-amber-500/15 text-amber-700 border-transparent' },
    'Muayene Bekliyor': { variant: 'secondary', className: '' },
    
    'Planlama': { variant: 'secondary', className: '' },
    'Uygulama': { variant: 'default', className: 'bg-blue-500/15 text-blue-700 border-transparent' },
    'Doğrulama': { variant: 'default', className: 'bg-purple-500/15 text-purple-700 border-transparent' },
    'Standartlaştırma': { variant: 'default', className: 'bg-indigo-500/15 text-indigo-700 border-transparent' },
    
    'Kritik': { variant: 'destructive', className: '' },
    'Yüksek': { variant: 'default', className: 'bg-orange-500/15 text-orange-700 border-transparent' },
    'Orta': { variant: 'default', className: 'bg-amber-500/15 text-amber-700 border-transparent' },
    'Düşük': { variant: 'secondary', className: '' },
    
    'A': { variant: 'default', className: 'bg-emerald-500/15 text-emerald-700 border-transparent' },
    'B': { variant: 'default', className: 'bg-blue-500/15 text-blue-700 border-transparent' },
    'C': { variant: 'default', className: 'bg-amber-500/15 text-amber-700 border-transparent' },
    'D': { variant: 'destructive', className: '' },
    
    'Aktif': { variant: 'default', className: 'bg-emerald-500/15 text-emerald-700 border-transparent' },
    'Pasif': { variant: 'secondary', className: '' },
    'Taslak': { variant: 'outline', className: '' },
};

/**
 * @param {Object} props
 * @param {string} props.status - Durum metni
 * @param {string} props.dueDate - Son tarih (ISO string) - gecikme kontrolü için
 * @param {boolean} props.showOverdue - Gecikme kontrolü aktif mi (default: true)
 * @param {string} props.size - Badge boyutu ('sm' | 'default' | 'lg')
 * @param {string} props.className - Ek CSS sınıfı
 * @param {React.ReactNode} props.icon - Opsiyonel ikon
 */
const StatusBadge = ({
    status,
    dueDate = null,
    showOverdue = true,
    size = 'default',
    className = '',
    icon = null,
}) => {
    if (!status) {
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }

    const isOverdue = showOverdue
        && dueDate
        && !['Kapatıldı', 'Kapalı', 'Tamamlandı', 'Reddedildi', 'İptal', 'İptal Edildi'].includes(status)
        && isValid(parseISO(dueDate))
        && isAfter(new Date(), parseISO(dueDate));

    if (isOverdue) {
        return (
            <Badge className={cn(
                'bg-red-500/15 text-red-700 border-transparent animate-pulse',
                size === 'sm' && 'text-[10px] px-1.5 py-0',
                size === 'lg' && 'text-sm px-3 py-1',
                className,
            )}>
                {icon && <span className="mr-1">{icon}</span>}
                Gecikmiş
            </Badge>
        );
    }

    const config = STATUS_CONFIG[status] || { variant: 'outline', className: '' };

    return (
        <Badge
            variant={config.variant}
            className={cn(
                config.className,
                size === 'sm' && 'text-[10px] px-1.5 py-0',
                size === 'lg' && 'text-sm px-3 py-1',
                className,
            )}
        >
            {icon && <span className="mr-1">{icon}</span>}
            {status}
        </Badge>
    );
};

export default StatusBadge;

export { STATUS_CONFIG };
