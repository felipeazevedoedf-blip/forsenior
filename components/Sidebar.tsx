
import React from 'react';
import { User, UserRole } from '../types';
import {
  IconHome, IconUsers, IconCalendar, IconPill, IconActivity, IconTarget,
  IconClipboardList, IconShieldAlert, IconHomeCheck, IconStethoscope,
  IconBarChart, IconSiren, IconSettings, IconSun, IconMoon, IconLogOut
} from './icons';

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
    { id: 'dashboard', label: 'Início', Icon: IconHome, roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.VIEWER] },
    { id: 'patients', label: 'Pacientes', Icon: IconUsers, roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.VIEWER] },
    { id: 'schedule', label: 'Agenda', Icon: IconCalendar, roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'medications', label: 'Remédios', Icon: IconPill, roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.VIEWER] },
    { id: 'tests', label: 'Testes Funcionais', Icon: IconActivity, roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'macro_cycle', label: 'Metas', Icon: IconTarget, roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'routine', label: 'Atividades do Dia', Icon: IconClipboardList, roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'safety', label: 'Checklist de Risco', Icon: IconShieldAlert, roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'env_check', label: 'Checklist Ambiental', Icon: IconHomeCheck, roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'professionals', label: 'Equipe', Icon: IconStethoscope, roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
    { id: 'reports', label: 'Relatório para médico', Icon: IconBarChart, roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.VIEWER] },
    { id: 'emergency', label: 'Emergência', Icon: IconSiren, roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.VIEWER], isCritical: true },
    { id: 'admin', label: 'Configurações', Icon: IconSettings, roles: [UserRole.ADMIN] },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      w-80 bg-gradient-to-b from-[#0f5a7a] to-[#0A3D52] dark:from-slate-900 dark:to-slate-950 text-white h-screen flex flex-col shadow-2xl border-r border-white/5
    `}>
      {/* IDENTIFICAÇÃO DO SISTEMA */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-[#3FC48C] to-vitalGreen rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-vitalGreen/30">FS</div>
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
      <nav className="flex-1 px-4 space-y-2.5 overflow-y-auto scrollbar-hide pb-10">
        {menuItems
          .filter(item => item.roles.includes(user.role))
          .map(item => {
            const active = currentPath === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold transition-all duration-200 group ${
                  item.isCritical
                  ? 'bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500 hover:text-white mt-4'
                  : active
                    ? 'bg-gradient-to-r from-[#37B37D] to-vitalGreen text-white shadow-lg shadow-vitalGreen/30 scale-[1.02]'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  active ? 'bg-white/20' : item.isCritical ? '' : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <item.Icon className={`w-5 h-5 ${active ? 'scale-110' : 'opacity-80 group-hover:opacity-100'}`} />
                </span>
                <span className="text-[15px] poppins tracking-tight text-left leading-tight">{item.label}</span>
                {active && !item.isCritical && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
      </nav>

      {/* RODAPÉ DA SIDEBAR */}
      <div className="p-6 mt-auto border-t border-white/10 bg-black/20">
        <div className="flex gap-2 mb-4">
          <button
            onClick={toggleDarkMode}
            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
          >
            {isDarkMode ? <IconMoon className="w-4 h-4 text-white/70" /> : <IconSun className="w-4 h-4 text-white/70" />}
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Tema</span>
          </button>

          <button onClick={onLogout} className="px-4 py-3 rounded-xl bg-red-400/5 hover:bg-red-400/20 text-red-400 transition-all border border-red-400/10">
            <IconLogOut className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[9px] text-center text-white/20 font-bold uppercase tracking-[0.2em]">v2.5 Stable • ForSênior Care</p>
      </div>
    </div>
  );
};

export default Sidebar;
