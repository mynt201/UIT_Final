import type { SVGProps } from 'react';

interface FloodGuardLogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

/** Logo FloodGuard: khiên + sóng nước, xanh dương–teal */
export default function FloodGuardLogo({ size = 40, className = '', ...props }: FloodGuardLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="fg-shield" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      {/* Shield */}
      <path
        d="M20 2L6 8v10c0 8 6 14 14 18 8-4 14-10 14-18V8L20 2z"
        fill="url(#fg-shield)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />
      {/* Wave / water */}
      <path
        d="M11 20h4c1.5 0 3-1 5-1s3.5 1 5 1h4v2h-4c-1.5 0-3 1-5 1s-3.5-1-5-1h-4v-2z"
        fill="white"
        fillOpacity="0.9"
      />
    </svg>
  );
}
