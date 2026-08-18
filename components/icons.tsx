
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

export const IconCheck: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <polyline points="4.5 12.5 9.5 17.5 19.5 6.5" />
  </svg>
);

export const IconCheckCircle: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="8.5" />
    <polyline points="8 12.3 10.8 15 16 9.5" />
  </svg>
);

export const IconXCircle: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="8.5" />
    <line x1="9" y1="9" x2="15" y2="15" />
    <line x1="15" y1="9" x2="9" y2="15" />
  </svg>
);

export const IconEdit: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M4 20h4.2L18.5 9.7a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L4 15.8V20z" />
    <line x1="13.2" y1="6.3" x2="17.7" y2="10.8" />
  </svg>
);

export const IconLightbulb: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M9 18h6" />
    <path d="M10 21.5h4" />
    <path d="M12 2.5a6.5 6.5 0 0 0-4 11.6c.8.7 1.3 1.4 1.3 2.4h5.4c0-1 .5-1.7 1.3-2.4A6.5 6.5 0 0 0 12 2.5z" />
  </svg>
);

export const IconPrinter: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <rect x="5.5" y="8.5" width="13" height="8" rx="1.6" />
    <path d="M7.5 8.5V4h9v4.5" />
    <path d="M7.5 15.5v4.2h9v-4.2" />
    <line x1="8.5" y1="11.5" x2="12" y2="11.5" />
  </svg>
);

export const IconLink: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M9.5 14.5 14.5 9.5" />
    <path d="M11 6.3 13 4.3a3.4 3.4 0 0 1 4.8 4.8l-2 2" />
    <path d="M13 17.7l-2 2a3.4 3.4 0 0 1-4.8-4.8l2-2" />
  </svg>
);

export const IconLock: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <rect x="5" y="11" width="14" height="9.5" rx="2" />
    <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11" />
  </svg>
);

export const IconKey: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l9-9" />
    <path d="M16 7l3 3" />
    <path d="M18.5 4.5l2 2" />
  </svg>
);

export const IconFileText: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M7 3.5h7l4 4v13H7z" />
    <path d="M14 3.5v4h4" />
    <line x1="9.5" y1="12.5" x2="15" y2="12.5" />
    <line x1="9.5" y1="16" x2="15" y2="16" />
  </svg>
);

export const IconFolder: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M3.5 6.5a1.5 1.5 0 0 1 1.5-1.5h4.3l2 2.3H19a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-11.3z" />
  </svg>
);

export const IconPhone: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M5.5 4h3l1.5 4-2 1.5a11.5 11.5 0 0 0 6.5 6.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2 17 17 0 0 1-14.3-14.3A2 2 0 0 1 5.5 4z" />
  </svg>
);

export const IconMail: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="M4.5 7l7.5 6 7.5-6" />
  </svg>
);

export const IconAward: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="8.5" r="5" />
    <path d="M9 12.7 7.8 21l4.2-2.4 4.2 2.4-1.2-8.3" />
  </svg>
);

export const IconFlag: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M6 3.5v17" />
    <path d="M6 4.5h10l-2.5 4L16 12.5H6" />
  </svg>
);

export const IconUtensils: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M7 3v7a2 2 0 0 0 4 0V3" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <path d="M16.5 3c-1.4 1-2 2.6-2 4.5S15.1 11 16.5 11V21" />
  </svg>
);

export const IconDroplet: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M12 3.5s6 6.7 6 11a6 6 0 1 1-12 0c0-4.3 6-11 6-11z" />
  </svg>
);

export const IconHeart: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M12 20.3S3.5 15 3.5 8.8a4.8 4.8 0 0 1 8.5-3 4.8 4.8 0 0 1 8.5 3c0 6.2-8.5 11.5-8.5 11.5z" />
  </svg>
);

export const IconBrain: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M9 4.5a3 3 0 0 0-3 3v.3A3 3 0 0 0 4.5 10.5a3 3 0 0 0 1 5.5A3 3 0 0 0 9 19.5" />
    <path d="M15 4.5a3 3 0 0 1 3 3v.3a3 3 0 0 1 1.5 2.7 3 3 0 0 1-1 5.5 3 3 0 0 1-3.5 3.5" />
    <line x1="9" y1="4.5" x2="9" y2="19.5" />
    <line x1="15" y1="4.5" x2="15" y2="19.5" />
  </svg>
);

export const IconScale: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <line x1="12" y1="3.5" x2="12" y2="20.5" />
    <line x1="6" y1="6.5" x2="18" y2="6.5" />
    <path d="M6 6.5 3 12.5h6L6 6.5z" />
    <path d="M18 6.5l-3 6h6l-3-6z" />
    <line x1="8.5" y1="20.5" x2="15.5" y2="20.5" />
  </svg>
);

export const IconEye: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
);

export const IconRuler: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <rect x="3" y="9" width="18" height="6" rx="1.5" transform="rotate(-20 12 12)" />
    <path d="M8.5 9.8 9.7 12" />
    <path d="M11.3 8.7 12.5 10.9" />
    <path d="M14 7.6 15.2 9.8" />
  </svg>
);

export const IconRocket: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M13.5 3.5c3 .5 5 2.5 5.5 5.5-2 3.5-4.5 6-8.5 8l-3-3c2-4 4.5-6.5 6-10.5z" />
    <circle cx="14.3" cy="9.7" r="1.3" />
    <path d="M9 15.5 6 18.5" />
    <path d="M8.5 12c-2 0-4 1.5-4.5 4.5 3-.5 4.5-2.5 4.5-4.5z" />
  </svg>
);

export const IconDownload: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <line x1="12" y1="3.5" x2="12" y2="15" />
    <polyline points="7 10.5 12 15.5 17 10.5" />
    <path d="M4.5 17v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2" />
  </svg>
);

export const IconUser: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.8 20c.5-4 3.3-6.5 7.2-6.5s6.7 2.5 7.2 6.5" />
  </svg>
);

export const IconHand: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M8 12V5a1.5 1.5 0 0 1 3 0v6" />
    <path d="M11 11V4a1.5 1.5 0 0 1 3 0v7" />
    <path d="M14 11.5V5.5a1.5 1.5 0 0 1 3 0v9" />
    <path d="M17 13v-2a1.5 1.5 0 0 1 3 0v4.5c0 3.6-2.4 6-6 6h-2c-2.3 0-3.6-.7-5-2.3L4 15.8c-.7-.8-.6-1.9.2-2.5.7-.6 1.8-.5 2.4.2L8 15" />
  </svg>
);

export const IconMessageCircle: React.FC<IconProps> = ({ className }) => (
  <svg className={className} {...base}>
    <path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4A8.7 8.7 0 0 1 8 19l-4.5 1 1.2-4a8.4 8.4 0 0 1-.7-3.5A8.4 8.4 0 0 1 12.5 3a8.4 8.4 0 0 1 8.5 8.5z" />
  </svg>
);
