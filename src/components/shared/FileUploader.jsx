/**
 * FileUploader - Tekrar kullanılabilir dosya yükleme bileşeni
 * Drag & drop + dosya seçimi destekler.
 * Mevcut bileşenleri BOZMAZ - yeni modüllerde ve refactor'larda kullanılabilir.
 */
import React from 'react';
import { UploadCloud, File as FileIcon, X, Loader2, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * @param {Object} props
 * @param {Function} props.getRootProps - useDropzone getRootProps
 * @param {Function} props.getInputProps - useDropzone getInputProps
 * @param {boolean} props.isDragActive - Drag active state
 * @param {Array} props.files - Seçilen dosyalar
 * @param {Function} props.onRemoveFile - Dosya kaldırma callback
 * @param {boolean} props.uploading - Upload devam ediyor mu
 * @param {number} props.uploadProgress - Upload ilerleme yüzdesi (0-100)
 * @param {string[]} props.errors - Hata mesajları
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.label - Drop zone label
 * @param {string} props.hint - Alt açıklama
 * @param {boolean} props.compact - Kompakt görünüm
 * @param {string} props.className - Ek CSS sınıfı
 */
const FileUploader = ({
    getRootProps,
    getInputProps,
    isDragActive = false,
    files = [],
    onRemoveFile,
    uploading = false,
    uploadProgress = 0,
    errors = [],
    disabled = false,
    label = 'Dosyaları sürükleyip bırakın veya tıklayarak seçin',
    hint = 'PNG, JPG, PDF, DOCX, XLSX - Max 50MB',
    compact = false,
    className = '',
}) => {
    const getFileIcon = (file) => {
        if (!file || !file.type) return <FileIcon className="h-4 w-4 text-muted-foreground" />;
        if (file.type.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
        if (file.type === 'application/pdf') return <FileText className="h-4 w-4 text-red-500" />;
        return <FileIcon className="h-4 w-4 text-muted-foreground" />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className={cn('space-y-3', className)}>
            <div
                {...(getRootProps ? getRootProps() : {})}
                className={cn(
                    'border-2 border-dashed rounded-xl transition-all cursor-pointer',
                    compact ? 'p-4' : 'p-6',
                    isDragActive
                        ? 'border-primary bg-primary/5 scale-[1.01]'
                        : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30',
                    disabled && 'opacity-50 cursor-not-allowed',
                    uploading && 'pointer-events-none opacity-70',
                )}
            >
                {getInputProps && <input {...getInputProps()} disabled={disabled || uploading} />}
                <div className={cn(
                    'flex flex-col items-center text-center',
                    compact ? 'gap-1.5' : 'gap-2.5',
                )}>
                    <div className={cn(
                        'rounded-xl bg-primary/10 flex items-center justify-center',
                        compact ? 'h-10 w-10' : 'h-14 w-14',
                    )}>
                        <UploadCloud className={cn(
                            'text-primary',
                            compact ? 'h-5 w-5' : 'h-7 w-7',
                        )} />
                    </div>
                    <p className={cn(
                        'font-semibold text-foreground',
                        compact ? 'text-xs' : 'text-sm',
                    )}>
                        {isDragActive ? 'Dosyayı bırakın...' : label}
                    </p>
                    {hint && !compact && (
                        <p className="text-xs text-muted-foreground">{hint}</p>
                    )}
                </div>
            </div>

            {uploading && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="font-medium">Yükleniyor... {uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                </div>
            )}

            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                        {files.length} dosya seçildi
                    </p>
                    <div className={cn(
                        'space-y-1',
                        files.length > 4 && 'max-h-40 overflow-y-auto',
                    )}>
                        {files.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40 group transition-colors hover:bg-muted/60"
                            >
                                {getFileIcon(file)}
                                <span className="text-xs text-foreground flex-1 truncate font-medium">
                                    {file.name}
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {formatFileSize(file.size)}
                                </span>
                                {onRemoveFile && !uploading && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveFile(file);
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {errors.length > 0 && (
                <div className="space-y-1">
                    {errors.map((err, index) => (
                        <p key={index} className="text-xs text-destructive font-medium">
                            {typeof err === 'string' ? err : err.message || 'Bir hata oluştu'}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUploader;
