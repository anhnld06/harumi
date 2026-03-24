import { FileSearch } from 'lucide-react';

interface NoDataProps {
  message?: string;
  description?: string;
}

export function NoData({ message = 'No data found', description }: NoDataProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 py-16">
      <div className="rounded-full bg-muted p-4">
        <FileSearch className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="font-medium text-muted-foreground">{message}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground/80">{description}</p>
        )}
      </div>
    </div>
  );
}
