
import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent',
  size?: 'sm' | 'md' | 'lg'
}> = ({ 
  children, className, variant = 'primary', size = 'md', ...props 
}) => {
  const variants = {
    primary: `bg-deepBlue text-white hover:bg-[#0A3D52] dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-900 shadow-sm`,
    secondary: `bg-vitalGreen text-white hover:bg-[#25855A] dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-900 shadow-sm`,
    accent: `bg-warmYellow text-textDark hover:bg-[#E0B83D] dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-slate-900 shadow-sm`,
    danger: `bg-red-500 text-white hover:bg-red-600 dark:bg-rose-500 dark:hover:bg-rose-400 shadow-sm`,
    ghost: `bg-white text-textDark border border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700`
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base'
  };
  
  return (
    <button 
      className={`rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 ${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode, title?: string }> = ({ 
  children, title, className, ...props 
}) => (
  <div 
    className={`bg-white rounded-[16px] border border-gray-100 card-shadow overflow-hidden dark:bg-slate-800 dark:border-slate-700/50 ${className || ''}`}
    {...props}
  >
    {title && (
      <div className="px-6 py-4 border-b border-gray-50 bg-white dark:bg-slate-800 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-deepBlue dark:text-sky-400 poppins tracking-tight uppercase opacity-80">{title}</h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string }> = ({ label, error, className, ...props }) => (
  <div className="mb-4 w-full">
    <div className="flex justify-between items-center mb-1.5 ml-1">
      <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      {props.required && <span className="text-[9px] font-bold text-red-400 dark:text-rose-400 uppercase">Obrigatório</span>}
    </div>
    <input 
      className={`w-full px-4 py-2.5 rounded-xl border transition-all text-sm outline-none focus:ring-2 focus:ring-deepBlue/10 focus:border-deepBlue dark:focus:border-sky-500 ${
        error 
        ? 'border-red-400 bg-red-50/50 dark:bg-rose-950/20 dark:border-rose-500' 
        : 'border-gray-200 bg-gray-50/30 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200'
      } ${className || ''}`}
      {...props}
    />
    {error && (
      <p className="mt-1.5 text-[10px] text-red-500 dark:text-rose-400 font-bold uppercase tracking-wide ml-1 animate-fade-in">
        ⚠ {error}
      </p>
    )}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'error' | 'primary' }> = ({ children, variant = 'default' }) => {
  const styles = {
    default: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300',
    primary: 'bg-deepBlue/10 text-deepBlue dark:bg-sky-500/20 dark:text-sky-400',
    success: 'bg-vitalGreen/10 text-vitalGreen dark:bg-emerald-500/20 dark:text-emerald-400',
    warning: 'bg-warmYellow/10 text-[#A6882E] dark:bg-amber-500/20 dark:text-amber-400',
    error: 'bg-red-50 text-red-600 dark:bg-rose-500/20 dark:text-rose-400'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 dark:border-slate-700">
          <h3 className="text-xl font-bold text-deepBlue dark:text-sky-400 poppins">{title}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-8 overflow-y-auto dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
};
