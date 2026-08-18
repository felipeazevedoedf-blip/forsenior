
import React from 'react';

export type IconProps = { className?: string };

const base = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
};

// Conjunto de ícones lineares (Prompt Mestre, seção 3: "ícones lineares"),
// substituindo os emojis usados no menu e nos cards principais.

export const IconHome: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v10h14V10" />
    <path d="M9.5 20v-6h5v6" />
  </svg>
);

export const IconUsers: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.2 20c.4-3.6 2.7-6 5.8-6s5.4 2.4 5.8 6" />
    <circle cx="17" cy="9.5" r="2.4" />
    <path d="M15.6 14.3c2 .5 3.4 2.4 3.7 5.2" />
  </svg>
);

export const IconCalendar: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
  </svg>
);

export const IconPill: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M6.3 17.7a5 5 0 0 1 0-7.07l4.3-4.3a5 5 0 0 1 7.07 7.07l-4.3 4.3a5 5 0 0 1-7.07 0z" />
    <line x1="9.3" y1="14.7" x2="14.7" y2="9.3" />
  </svg>
);

export const IconActivity: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M3 12h4l2.2 6 3.6-15L15 12h6" />
  </svg>
);

export const IconTarget: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const IconClipboardList: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <rect x="5.5" y="4.2" width="13" height="17.6" rx="2.2" />
    <rect x="9" y="2.5" width="6" height="3.4" rx="1" />
    <line x1="8.5" y1="11.5" x2="15.5" y2="11.5" />
    <line x1="8.5" y1="15.5" x2="15.5" y2="15.5" />
  </svg>
);

export const IconShieldAlert: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M12 3.2 19.5 6v6.2c0 4.6-3.1 7.9-7.5 8.9-4.4-1-7.5-4.3-7.5-8.9V6L12 3.2z" />
    <line x1="12" y1="9" x2="12" y2="13.2" />
    <circle cx="12" cy="16" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconHomeCheck: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v10h14V10" />
    <path d="M9.3 14.7 11 16.4l3.7-3.7" />
  </svg>
);

export const IconStethoscope: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M5.5 3v5.5a3.5 3.5 0 0 0 7 0V3" />
    <path d="M9 12.5v2a5.5 5.5 0 0 0 11 0v-2" />
    <circle cx="20" cy="9.5" r="2" />
  </svg>
);

export const IconBarChart: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <line x1="5" y1="20" x2="5" y2="12" />
    <line x1="12" y1="20" x2="12" y2="6.5" />
    <line x1="19" y1="20" x2="19" y2="15.5" />
    <line x1="2.5" y1="20" x2="21.5" y2="20" />
  </svg>
);

export const IconSiren: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M8.2 3.5h7.6L21 8.7v6.6L15.8 20.5H8.2L3 15.3V8.7L8.2 3.5z" />
    <line x1="12" y1="8" x2="12" y2="12.4" />
    <circle cx="12" cy="15.5" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSettings: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="3.2" />
    <circle cx="12" cy="12" r="8" strokeDasharray="2.4 2.8" />
  </svg>
);

export const IconSun: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="4.2" />
    <line x1="12" y1="2.5" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="21.5" />
    <line x1="4.6" y1="4.6" x2="6.3" y2="6.3" />
    <line x1="17.7" y1="17.7" x2="19.4" y2="19.4" />
    <line x1="2.5" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="21.5" y2="12" />
    <line x1="4.6" y1="19.4" x2="6.3" y2="17.7" />
    <line x1="17.7" y1="6.3" x2="19.4" y2="4.6" />
  </svg>
);

export const IconMoon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5a6.8 6.8 0 0 0 10 10z" />
  </svg>
);

export const IconLogOut: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M9.5 3.5H6a2.2 2.2 0 0 0-2.2 2.2v12.6A2.2 2.2 0 0 0 6 20.5h3.5" />
    <polyline points="15.5 16.5 20 12 15.5 7.5" />
    <line x1="20" y1="12" x2="9.5" y2="12" />
  </svg>
);

export const IconMenu: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <line x1="3.5" y1="6.5" x2="20.5" y2="6.5" />
    <line x1="3.5" y1="12" x2="20.5" y2="12" />
    <line x1="3.5" y1="17.5" x2="20.5" y2="17.5" />
  </svg>
);

export const IconX: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
    <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
  </svg>
);

export const IconChevronDown: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <polyline points="5.5 8.5 12 15 18.5 8.5" />
  </svg>
);

export const IconArrowLeft: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <line x1="20" y1="12" x2="4" y2="12" />
    <polyline points="10.5 18.5 4 12 10.5 5.5" />
  </svg>
);

export const IconClock: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="8.5" />
    <polyline points="12 7 12 12 15.5 14" />
  </svg>
);

export const IconAlertTriangle: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M12 3.5 22 20.5H2L12 3.5z" />
    <line x1="12" y1="9.5" x2="12" y2="14" />
    <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconTrendingUp: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <polyline points="3 17 9.5 10.5 13.5 14.5 21 7" />
    <polyline points="14.5 7 21 7 21 13.5" />
  </svg>
);
