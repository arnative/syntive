export function DotLinearSpectrum({ isPlaying }: { isPlaying: boolean }) {
  const bars = [40, 75, 30, 90, 50, 100, 60, 85, 45, 95, 35, 70, 55, 90, 40, 80, 60, 30];

  return (
    <div className="flex-1 flex items-center justify-between gap-0.75 h-6 px-2 overflow-hidden">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-300 ${
            isPlaying ? 'bg-primary animate-pulse' : 'bg-muted-foreground/25'
          }`}
          style={{
            height: isPlaying ? `${h}%` : '15%',
            animationDelay: isPlaying ? `${(i % 5) * 0.15}s` : '0s',
            animationDuration: isPlaying ? `${0.4 + (i % 4) * 0.2}s` : '0s',
          }}
        />
      ))}
    </div>
  );
}

