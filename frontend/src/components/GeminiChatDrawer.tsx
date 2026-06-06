"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import { apiClient } from '@/lib/api-client';
import './GeminiChatDrawer.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function GeminiChatDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou seu assistente de compras. Como posso ajudar?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const data = await apiClient.post<{ response: string }>('/assistent/message', { history: newMessages });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, tive um erro ao processar sua mensagem.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`chat-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`chat-drawer ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3>Assistente IA</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <FiX size={24} />
          </button>
        </div>
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && <div className="message assistant">Digitando...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <input 
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte algo..."
            disabled={isLoading}
          />
          <button className="send-btn" onClick={handleSend} disabled={isLoading || !input.trim()}>
            <FiSend />
          </button>
        </div>
      </div>
    </>
  );
}
