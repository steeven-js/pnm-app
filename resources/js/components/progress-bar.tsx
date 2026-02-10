type ProgressBarProps = {
    value: number;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
};

export function ProgressBar({ value, color = '#3b82f6', size = 'md', showLabel = true }: ProgressBarProps) {
    const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

    return (
        <div className="flex items-center gap-2">
            <div className={`bg-muted flex-1 overflow-hidden rounded-full ${heights[size]}`}>
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }}
                />
            </div>
            {showLabel && (
                <span className="text-muted-foreground text-xs font-medium tabular-nums">
                    {Math.round(value)}%
                </span>
            )}
        </div>
    );
}
