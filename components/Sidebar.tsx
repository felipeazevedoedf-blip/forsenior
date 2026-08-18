
import React from 'react';
import { User, UserRole } from '../types';

interface SidebarProps {
  user: User;
  onNavigate: (path: string) => void;
  currentPath: string;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  user, onNavigate, currentPath, onLogout, isOpen, onClose, isDarkMode, toggleDarkMode 
}) => {
  // Menu Profissional: centraliza todas as funcionalidades definidas no Prompt Mestre (seção 6).
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: '🏠', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.VIEWER] },
    { id: 'patients', label: 'Pacientes', icon: '🧑‍🤝‍🧑', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.VIEWER] },
    { id: 'schedule', label: 'Agenda', icon: '🗓️', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'medications', label: 'Remédios', icon: '💊', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.VIEWER] },
    { id: 'tests', label: 'Testes Funcionais', icon: '📈', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'macro_cycle', label: 'Metas', icon: '🎯', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'routine', label: 'Atividades do Dia', icon: '📋', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'safety', label: 'Checklist de Risco', icon: '🚨', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'env_check', label: 'Checklist Ambiental', icon: '🏠', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'professionals', label: 'Equipe', icon: '🩺', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'reports', label: 'Relatório para médico', icon: '📊', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.VIEWER] },
    { id: 'emergency', label: 'Emergência', icon: '🆘', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.VIEWER], isCritical: true },
    { id: 'admin', label: 'Configurações', icon: '⚙️', roles: [UserRole.ADMIN] },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      w-80 bg-deepBlue dark:bg-slate-900 text-white h-screen flex flex-col shadow-2xl border-r border-white/5
    `}>
      {/* IDENTIFICAÇÃO DO SISTEMA */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-vitalGreen rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">FS</div>
          <div>
            <h1 className="text-xl font-bold poppins tracking-tight leading-tight">ForSênior</h1>
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Cuidado Humano</p>
          </div>
        </div>

        {/* PERFIL DO USUÁRIO - SIMPLIFICADO */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-2">
           <p className="text-[9px] font-black uppercase text-vitalGreen tracking-widest mb-1">{user.role === 'ADMIN' ? 'Administrador' : 'Cuidador'}</p>
           <p className="text-base font-bold truncate">{user.name.split(' ')[0]}</p>
        </div>
      </div>
      
      {/* MENU NAVEGAÇÃO - ESPAÇAMENTO GENEROSO */}
      <nav className="flex-1 px-4 space-y-3 overflow-y-auto scrollbar-hide pb-10">
        {menuItems
          .filter(item => item.roles.includes(user.role))
          .map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-5 px-5 py-4 rounded-2xl font-bold transition-all group ${
                item.isCritical 
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white mt-4' 
                : currentPath === item.id 
                  ? 'bg-vitalGreen text-white shadow-xl scale-[1.02]' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`text-2xl transition-transform ${currentPath === item.id ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`}>
                {item.icon}
              </span>
              <span className="text-lg poppins tracking-tight">{item.label}</span>
              {currentPath === item.id && !item.isCritical && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
      </nav>

      {/* RODAPÉ DA SIDEBAR */}
      <div className="p-6 mt-auto border-t border-white/10 bg-black/20">
        <div className="flex gap-2 mb-4">
          <button 
            onClick={toggleDarkMode}
            className="flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
          >
            <span className="text-xl">{isDarkMode ? '🌙' : '☀️'}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Tema</span>
          </button>
          
          <button onClick={onLogout} className="px-4 py-3 rounded-xl bg-red-400/5 hover:bg-red-400/20 text-red-400 transition-all border border-red-400/10">
            <span className="text-lg">🚪</span>
          </button>
        </div>
        
        <p className="text-[9px] text-center text-white/20 font-bold uppercase tracking-[0.2em]">v2.5 Stable • ForSênior Care</p>
      </div>
    </div>
  );
};

export default Sidebar;
