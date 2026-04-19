import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'card' | 'avatar';
}

export function Skeleton({ className, width, height, variant = 'text' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[rgba(139,107,50,0.1)] border border-border-dark',
        variant === 'text' && 'rounded-sm',
        variant === 'card' && 'rounded-md shadow-inner',
        variant === 'avatar' && 'rounded-full',
        className
      )}
      style={{ width, height }}
    />
  );
}

export function SkeletonTaskCard() {
  return (
    <div className="bg-[rgba(18,14,12,0.6)] border border-border-dark p-3 lg:p-4 opacity-80 flex flex-col gap-2 rounded-sm shadow-sm group">
      <div className="flex justify-between items-start">
        <Skeleton variant="text" width="60%" height="24px" className="bg-[rgba(139,107,50,0.15)]" />
        <Skeleton variant="avatar" width="20px" height="20px" className="bg-[rgba(139,107,50,0.15)]" />
      </div>
      <Skeleton variant="text" width="100%" height="16px" className="mt-2 bg-[rgba(139,107,50,0.08)]" />
      <Skeleton variant="text" width="80%" height="16px" className="bg-[rgba(139,107,50,0.08)]" />
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border-dark/50">
        <Skeleton variant="text" width="40px" height="16px" className="bg-[rgba(139,107,50,0.15)]" />
        <Skeleton variant="text" width="80px" height="24px" className="rounded-full bg-[rgba(139,107,50,0.15)]" />
      </div>
    </div>
  );
}

export function SkeletonChatBubble({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[85%] md:max-w-[75%] p-3 md:p-4 border rounded-sm w-full md:w-2/3",
        isUser 
          ? "bg-[rgba(139,30,30,0.05)] border-accent-red/30" 
          : "bg-[rgba(18,14,12,0.8)] border-[rgba(58,38,24,0.6)]"
      )}>
        {isUser ? (
           <Skeleton variant="text" width="80%" height="16px" className="bg-[rgba(139,30,30,0.2)] ml-auto" />
        ) : (
          <>
            <Skeleton variant="text" width="100%" height="16px" className="mb-2 bg-[rgba(139,107,50,0.15)]" />
            <Skeleton variant="text" width="90%" height="16px" className="mb-2 bg-[rgba(139,107,50,0.12)]" />
            <Skeleton variant="text" width="80%" height="16px" className="bg-[rgba(139,107,50,0.1)]" />
          </>
        )}
      </div>
    </div>
  );
}

export function SkeletonKnowledgeRow() {
  return (
    <div className="p-3 border-b border-border-dark last:border-b-0 flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(0,0,0,0.3)] transition-colors">
      <Skeleton variant="card" width="48px" height="48px" className="flex-shrink-0 bg-[rgba(139,107,50,0.15)]" />
      <div className="flex-1 w-full space-y-2">
        <div className="flex justify-between items-center gap-4">
          <Skeleton variant="text" width="40%" height="20px" className="bg-[rgba(139,107,50,0.15)]" />
          <Skeleton variant="text" width="80px" height="20px" className="bg-[rgba(139,107,50,0.15)]" />
        </div>
        <Skeleton variant="text" width="60%" height="16px" className="bg-[rgba(139,107,50,0.08)]" />
      </div>
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="w-full h-full flex flex-col p-4 gap-6">
      <div className="flex items-center gap-4 border-b-4 border-border-dark pb-4">
        <Skeleton variant="avatar" width="40px" height="40px" className="bg-[rgba(139,107,50,0.2)]" />
        <Skeleton variant="text" width="250px" height="32px" className="bg-[rgba(139,107,50,0.15)]" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton variant="card" width="100%" height="200px" className="bg-[rgba(139,107,50,0.1)]" />
        <Skeleton variant="card" width="100%" height="200px" className="bg-[rgba(139,107,50,0.1)]" />
        <Skeleton variant="card" width="100%" height="200px" className="bg-[rgba(139,107,50,0.1)]" />
        <Skeleton variant="card" width="100%" height="200px" className="bg-[rgba(139,107,50,0.1)]" />
      </div>
    </div>
  );
}
