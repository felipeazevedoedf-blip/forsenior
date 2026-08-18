
import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { User, UserRole } from '../types';
import { store } from '../services/store';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';

interface LoginProps {
  onLogin: (user: User) => void;
  onFamilyPortal?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onFamilyPortal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [testRole, setTestRole] = useState<UserRole>(UserRole.PROFESSIONAL);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured) {
      setError("O Firebase não está configurado com chaves reais. Por favor, utilize o Modo de Demonstração.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          clinicId: 'FS-01',
          name: firebaseUser.displayName || 'Usuário ForSênior',
          email: firebaseUser.email || '',
          role: testRole
        };

        store.setCurrentUser(userData);
        onLogin(userData);
      }
    } catch (err: any) {
      console.error("Erro ao autenticar com Google:", err);
      setError("Erro na conexão com Google. Tente o Modo de Demonstração.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const demoUser: User = {
        id: 'demo-user-123',
        clinicId: 'FS-01',
        name: 'Profissional Demo',
        email: 'demo@forsenior.com',
        role: testRole
      };
      // Fixed: Removed call to non-existent store.setLanguage method
      store.setCurrentUser(demoUser);
      onLogin(demoUser);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#0D4F6A] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#2E9E6A] opacity-5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-[#0D4F6A] to-[#2E9E6A] rounded-[2rem] mx-auto flex items-center justify-center text-white text-5xl font-extrabold shadow-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            FS
          </div>
          <h1 className="text-4xl font-bold text-[#0D4F6A] poppins tracking-tight">ForSênior Care</h1>
          <p className="mt-3 text-gray-500 font-medium">Gestão Inteligente de Cuidados Geriátricos</p>
        </div>

        <Card className="shadow-2xl border-none p-8 bg-white/80 backdrop-blur-md">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[#33383D] mb-2">Acesso Profissional</h2>
              <p className="text-sm text-gray-400">Entre para gerenciar seus cuidados</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-[11px] font-bold rounded-xl border border-red-100 animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-3 text-center tracking-widest">
                Selecione seu Perfil Clínico
              </label>
              <div className="flex gap-2">
                {(['PROFESSIONAL', 'ADMIN', 'VIEWER'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setTestRole(role)}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                      testRole === role 
                        ? 'bg-[#0D4F6A] text-white shadow-md' 
                        : 'bg-white text-gray-400 border border-gray-200 hover:border-[#0D4F6A]'
                    }`}
                  >
                    {role === 'PROFESSIONAL' ? 'EQUIPE' : role}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
                className={`w-full py-4 flex items-center justify-center gap-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all group ${!isFirebaseConfigured ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                variant="ghost"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#0D4F6A] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                    <span className="font-semibold poppins">Entrar com Google</span>
                  </>
                )}
              </Button>

              <button 
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full py-3 text-xs font-bold text-[#0D4F6A] hover:underline transition-all"
              >
                Acessar via Modo de Demonstração
              </button>

              {onFamilyPortal && (
                <button
                  onClick={onFamilyPortal}
                  className="w-full py-3 text-xs font-bold text-[#2E9E6A] hover:underline transition-all"
                >
                  Sou Família ou Responsável
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-300 uppercase tracking-widest">Proteção LGPD</span>
              </div>
            </div>

            <p className="text-[10px] text-center text-gray-400 leading-relaxed px-4">
              Os dados são processados localmente ou via Firebase seguindo as diretrizes da <strong>LGPD</strong>.
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center text-xs text-gray-500">
          <span>v2.2.2 (Stable)</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
