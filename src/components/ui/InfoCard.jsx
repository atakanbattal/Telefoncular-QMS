import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const InfoCard = ({ icon: Icon, label, value, variant = 'default' }) => {
    const variants = {
        default: 'bg-background border-border/60',
        primary: 'bg-primary/5 border-primary/15',
        success: 'bg-emerald-50 border-emerald-200/60',
        warning: 'bg-amber-50 border-amber-200/60',
        danger: 'bg-red-50 border-red-200/60',
        info: 'bg-blue-50 border-blue-200/60',
    };

    return (
        <Card className={variants[variant]}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    {Icon && (
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                        <div className="text-sm font-bold text-foreground break-words font-headline">{value ?? '-'}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
