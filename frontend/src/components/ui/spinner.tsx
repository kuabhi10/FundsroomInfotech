import { Loader2 } from 'lucide-react';

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={`flex flex-1 justify-center items-center p-8 min-h-[50vh] ${className || ''}`}>
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}
