import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ icon: Icon, title, subtitle, value, color, onClick, loading }) => (
    <motion.div
        whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)' }}
        className="h-full"
    >
        <Card className="h-full cursor-pointer hover:border-primary/30 transition-all" onClick={onClick}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    {subtitle && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{subtitle}</p>}
                </div>
                {Icon && (
                    <div className={`p-2 rounded-lg ${color ? '' : 'bg-primary/10'}`}>
                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color || 'text-primary'}`} />
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-3/4 mt-1" />
                ) : (
                    <div className={`text-2xl sm:text-3xl font-extrabold font-headline ${color || 'text-foreground'}`}>{value}</div>
                )}
            </CardContent>
        </Card>
    </motion.div>
);

export default StatCard;
