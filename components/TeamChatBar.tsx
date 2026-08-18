
import React, { useState, useEffect, useRef } from 'react';
import { store } from '../services/store';
import { User, ChatMessage } from '../types';
import { Button, Badge } from './ui';
import { IconUsers } from './icons';

interface TeamChatBarProps {
  user: User;
}

const TeamChatBar: React.FC<TeamChatBarProps> = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomId = 'team-global';

  useEffect(() => {
    const loadMessages = () => {
      const msgs = store.getMessages(roomId);
      setMessages(msgs);
    };
    loadMessages();
    // Poll para simular tempo real no mock
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      text: inputText,
      timestamp: new Date().toISOString(),
      roomId: roomId
    };
    store.addMessage(newMessage);
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <div className={`mb-4 transition-all duration-300 ease-in-out ${isExpanded ? 'h-80' : 'h-12'}`}>
      <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-[#0D4F6A]/10 shadow-lg' : ''}`}>
        
        {/* Header da Barra */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 h-12 flex items-center justify-between cursor-pointer hover:bg-gray-50 shrink-0"
        >
          <div className="flex items-center gap-3">
            <IconUsers className="w-5 h-5 text-[#0D4F6A]" />
            <div>
              <span className="text-sm font-bold text-[#0D4F6A] poppins">Canal da Equipe</span>
              {!isExpanded && messages.length > 0 && (
                <span className="ml-3 text-[10px] text-gray-400 font-medium truncate hidden sm:inline">
                  Última: {messages[messages.length - 1].text}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isExpanded && <Badge variant="success">{messages.length}</Badge>}
            <button className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-[#0D4F6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Área de Mensagens Expandida */}
        {isExpanded && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
              {messages.length === 0 ? (
                <p className="text-center py-10 text-gray-400 text-xs italic">Nenhuma mensagem no canal da equipe.</p>
              ) : (
                messages.map((msg, idx) => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                      msg.senderId === user.id 
                        ? 'bg-[#0D4F6A] text-white rounded-tr-none' 
                        : 'bg-white text-[#33383D] border border-gray-100 rounded-tl-none shadow-sm'
                    }`}>
                      <div className="flex justify-between items-center gap-4 mb-1">
                        <span className={`font-black text-[9px] uppercase tracking-tighter ${msg.senderId === user.id ? 'text-white/70' : 'text-[#0D4F6A]'}`}>
                          {msg.senderName}
                        </span>
                        <span className="opacity-50 text-[8px]">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
              <div className="flex gap-2">
                <input 
                  autoFocus
                  className="flex-1 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-[#0D4F6A] text-sm"
                  placeholder="Mensagem rápida para a equipe..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <Button size="sm" onClick={handleSend} className="px-4">Enviar</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamChatBar;
