import React from 'react';

interface LogoProps {
  size?: number | string;
  className?: string;
  variant?: 'full' | 'icon' | 'badge';
  showText?: boolean;
}

export const LogoIcon: React.FC<{ size?: number | string; className?: string }> = ({
  size = 32,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <defs>
        {/* Primary gradient across document fold */}
        <linearGradient id="k_bg_grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="0.5" stopColor="#4338CA" />
          <stop offset="1" stopColor="#312E81" />
        </linearGradient>

        {/* Vertical Spine Document Sheet */}
        <linearGradient id="k_spine_grad" x1="12" y1="10" x2="20" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E0E7FF" />
        </linearGradient>

        {/* Upper Transforming Sheet */}
        <linearGradient id="k_upper_grad" x1="18" y1="12" x2="36" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818CF8" />
          <stop offset="1" stopColor="#C7D2FE" />
        </linearGradient>

        {/* Lower Transforming Sheet */}
        <linearGradient id="k_lower_grad" x1="18" y1="24" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#818CF8" />
        </linearGradient>

        {/* Subtle drop shadow filter */}
        <filter id="k_shadow" x="0" y="2" width="48" height="48" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1E1B4B" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Squircle App Icon Container */}
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="11"
        fill="url(#k_bg_grad)"
        filter="url(#k_shadow)"
      />

      {/* Document Sheet Silhouette Backdrop */}
      <path
        d="M12 11C12 9.89543 12.8954 9 14 9H29.5L36 15.5V37C36 38.1046 35.1046 39 34 39H14C12.8954 39 12 38.1046 12 37V11Z"
        fill="white"
        fillOpacity="0.08"
      />

      {/* Folded Corner Accent */}
      <path
        d="M29 9V14C29 15.1046 29.8954 16 31 16H36L29 9Z"
        fill="white"
        fillOpacity="0.18"
      />

      {/* Stylized 'K' - Vertical Spine Sheet */}
      <rect
        x="13.5"
        y="12"
        width="5.5"
        height="24"
        rx="2.75"
        fill="url(#k_spine_grad)"
      />

      {/* Stylized 'K' - Upper Transforming Branch */}
      <path
        d="M19 23.5L29.6 13.2C30.4 12.4 31.8 12.6 32.4 13.5C33.1 14.4 32.9 15.7 32 16.5L22.5 25.5L19 23.5Z"
        fill="url(#k_upper_grad)"
      />

      {/* Stylized 'K' - Lower Transforming Branch */}
      <path
        d="M18.8 24.2L30.2 34.6C31.1 35.4 32.5 35.3 33.2 34.3C33.8 33.3 33.6 31.9 32.6 31.1L23 22.5L18.8 24.2Z"
        fill="url(#k_lower_grad)"
      />

      {/* Intersection Node Accent */}
      <circle cx="20.5" cy="24" r="2.2" fill="#FFFFFF" />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 32,
  className = '',
  showText = true
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
          Kathir<span className="text-indigo-600 font-extrabold">Doc</span>Converter
        </span>
      )}
    </div>
  );
};
