
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { store } from '../services/store';
import { User, ChatMessage, ChatRoom, Professional } from '../types';

interface ChatProps {
  user: User;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [professionals] = useState<Professional[]>(store.getProfessionals());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filtramos apenas salas individuais (private chats)
    const availableRooms = store.getChatRooms(user.id).filter(r => r.type === 'individual');
    setRooms(availableRooms);
    
    if (availableRooms.length > 0 && !activeRoomId) {
      setActiveRoomId(availableRooms[0].id);
    }
  }, [user.id]);

  useEffect(() => {
    if (activeRoomId) {
      loadMessages(activeRoomId);
    }
  }, [activeRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = (roomId: string) => {
    const msgs = store.getMessages(roomId);
    setMessages(msgs);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeRoomId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      text: inputText,
      timestamp: new Date().toISOString(),
      roomId: activeRoomId
    };

    store.addMessage(newMessage);
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const handleStartPrivateChat = (prof: Professional) => {
    if (prof.id === user.id) return;
    const room = store.findOrCreateIndividualRoom(user.id, prof.id, user.name, prof.name);
    const updatedRooms = store.getChatRooms(user.id).filter(r => r.type === 'individual');
    setRooms(updatedRooms);
    setActiveRoomId(room.id);
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-180px)] gap-6 animate-fade-in">
      {/* Sidebar de Conversas */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-[#0D4F6A] poppins">Conversas Privadas</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs italic">
                Nenhuma conversa iniciada. Selecione um colega abaixo.
              </div>
            ) : (
              rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`w-full text-left p-4 border-b border-gray-50 transition-all hover:bg-gray-50 flex items-center gap-3 ${
                    activeRoomId === room.id ? 'bg-blue-50 border-l-4 border-l-[#0D4F6A]' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#2E9E6A] flex items-center justify-center font-bold text-white">
                    {room.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#33383D] truncate text-sm">{room.name}</p>
                    <p className="text-[10px] text-gray-400 truncate font-medium">{room.lastMessage || 'Mensagens diretas'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4 bg-gray-50 border-none shadow-none hidden md:block">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Contatos da Equipe</h4>
          <div className="space-y-2">
            {professionals.filter(p => p.id !== user.id).map(p => (
              <button 
                key={p.id} 
                onClick={() => handleStartPrivateChat(p)}
                className="w-full flex items-center gap-2 p-2 hover:bg-white rounded-xl transition-all group text-left"
              >
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-bold text-[#33383D] group-hover:text-[#0D4F6A]">{p.name}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Janela do Chat Individual */}
      <Card className="flex-1 flex flex-col p-0 overflow-hidden relative">
        {activeRoom ? (
          <>
            {/* Header do Chat */}
            <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2E9E6A] flex items-center justify-center font-bold text-white">
                   {activeRoom.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[#0D4F6A] poppins">{activeRoom.name}</h3>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">● Online agora</p>
                </div>
              </div>
              <Badge variant="default">CRIPTOGRAFIA PONTA-A-PONTA</Badge>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === user.id;
                const showSender = !isMe && (idx === 0 || messages[idx-1].senderId !== msg.senderId);

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {showSender && <span className="text-[10px] font-black text-gray-400 mb-1 ml-2 uppercase tracking-tighter">{msg.senderName}</span>}
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                      isMe 
                        ? 'bg-[#0D4F6A] text-white rounded-tr-none' 
                        : 'bg-white text-[#33383D] border border-gray-100 rounded-tl-none'
                    }`}>
                      {msg.text}
                      <div className={`text-[9px] mt-1 text-right opacity-50 ${isMe ? 'text-white' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <div className="flex gap-3">
                <input 
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-[#0D4F6A] transition-all text-sm font-medium"
                  placeholder="Escreva para seu colega..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  variant="primary" 
                  className="px-6 shadow-lg shadow-blue-900/10"
                  onClick={handleSendMessage}
                >
                  Enviar
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <span className="text-5xl">💬</span>
            <p className="font-bold poppins">Selecione uma conversa privada para começar.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Chat;
