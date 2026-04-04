import React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef(({ className, autoFormat = false, onBlur, onChange, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
        className
      )}
      ref={ref}
      onBlur={onBlur}
      onChange={onChange}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
