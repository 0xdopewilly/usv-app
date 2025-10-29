export const USVIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="usvGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#usvGradient)" />
    <text
      x="50"
      y="50"
      textAnchor="middle"
      dominantBaseline="central"
      fill="white"
      fontSize="32"
      fontWeight="bold"
      fontFamily="Arial, sans-serif"
    >
      USV
    </text>
  </svg>
);

export const SOLIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="solGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14F195" />
        <stop offset="100%" stopColor="#9945FF" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#solGradient)" />
    <path
      d="M26 60 L40 45 C41 44 42 43 44 43 L74 43 C76 43 76.5 44 75 45.5 L60 61 C59 62 58 63 56 63 L26 63 C24 63 23.5 62 25 60.5 Z"
      fill="white"
      opacity="0.9"
    />
    <path
      d="M26 40 L40 25 C41 24 42 23 44 23 L74 23 C76 23 76.5 24 75 25.5 L60 41 C59 42 58 43 56 43 L26 43 C24 43 23.5 42 25 40.5 Z"
      fill="white"
    />
    <path
      d="M26 80 L40 65 C41 64 42 63 44 63 L74 63 C76 63 76.5 64 75 65.5 L60 81 C59 82 58 83 56 83 L26 83 C24 83 23.5 82 25 80.5 Z"
      fill="white"
      opacity="0.7"
    />
  </svg>
);

export const getTokenIcon = (symbol: string, className?: string) => {
  switch (symbol.toUpperCase()) {
    case 'SOL':
      return <SOLIcon className={className} />;
    case 'USV':
      return <USVIcon className={className} />;
    default:
      return (
        <div className={`${className || 'w-10 h-10'} bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center`}>
          <span className="text-white font-bold text-sm">{symbol.slice(0, 3)}</span>
        </div>
      );
  }
};
