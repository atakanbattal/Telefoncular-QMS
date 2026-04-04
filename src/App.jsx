import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { NCFormProvider } from '@/contexts/NCFormContext';
import { Toaster } from '@/components/ui/toaster';

import Login from '@/pages/Login';
import SupplierPortalPage from '@/pages/SupplierPortalPage';
import PrintableReport from '@/pages/PrintableReport';
import PrintableDashboardReport from '@/pages/PrintableDashboardReport';
import PrintableInternalAuditDashboard from '@/pages/PrintableInternalAuditDashboard';
import A3QualityBoardReport from '@/pages/A3QualityBoardReport';

import AuthProtected from '@/components/auth/AuthProtected';
import MainLayout from '@/components/layout/MainLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';

/** index.html ile aynı sürüm — önbellek kırma; dosya gerçek PNG olmalı (JPEG .png uzantılı olmasın). */
const FAVICON_PNG = '/favicon.png?v=44b2259b';
const APPLE_ICON = '/apple-touch-icon.png?v=44b2259b';

function App() {
  return (
        <HelmetProvider>
            <Helmet>
                <link rel="icon" type="image/png" sizes="128x128" href={FAVICON_PNG} />
                <link rel="shortcut icon" type="image/png" href={FAVICON_PNG} />
                <link rel="apple-touch-icon" href={APPLE_ICON} />
            </Helmet>
            <ErrorBoundary>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/supplier-portal" element={<SupplierPortalPage />} />
                    <Route path="/print/report/:type/:id" element={<AuthProtected><PrintableReport /></AuthProtected>} />
                    <Route path="/print/dashboard-report" element={<AuthProtected><PrintableDashboardReport /></AuthProtected>} />
                    <Route path="/print/a3-quality-board" element={<AuthProtected><A3QualityBoardReport /></AuthProtected>} />
                    <Route path="/print/internal-audit-dashboard" element={<AuthProtected><PrintableInternalAuditDashboard /></AuthProtected>} />
                    {/* DataProvider / NCFormProvider yalnızca ana kabuk: useData + useNCForm tüm modüllerde tutarlı */}
                    <Route path="/*" element={
                        <AuthProtected>
                            <DataProvider>
                                <NCFormProvider>
                                    <MainLayout />
                                </NCFormProvider>
                            </DataProvider>
                        </AuthProtected>
                    } />
                </Routes>
                <Toaster />
            </AuthProvider>
            </ErrorBoundary>
        </HelmetProvider>
    );
}

export default App;
