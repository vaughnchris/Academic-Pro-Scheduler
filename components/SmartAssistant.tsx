
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, X } from 'lucide-react';
import { askScheduleAssistant } from '../services/geminiService';
import { ClassSection, FacultyRequest, ChatMessage } from '../types';

interface Props {
  schedule: ClassSection[];
  requests: FacultyRequest[];
  onClose: () => void;
}

const SmartAssistant: React.FC<Props> = ({ schedule, requests, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I can help you analyze the schedule. Ask me about faculty requests, conflicts, or unstaffed classes.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const answer = await askScheduleAssistant(input, schedule, requests);
    
    setMessages(prev => [...prev, { role: 'model', text: answer, timestamp: new Date() }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl w-full max-w-sm fixed right-0 top-0 bottom-0 z-40 transform transition-transform animate-in slide-in-from-right duration-300">
      <div className="bg-blue-900 text-white p-4 flex items-center justify-between shadow">
        <div className="flex items-center">
            <Bot className="w-6 h-6 mr-2" />
            <h2 className="font-semibold text-lg">Schedule Assistant</h2>
        </div>
        <button 
            onClick={onClose}
            className="text-blue-100 hover:text-white p-1 rounded-full hover:bg-blue-800 transition-colors"
            title="Close Assistant"
        >
            <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'
            }`}>
              {msg.text.split('\n').map((line, l) => (
                <p key={l} className="mb-1 last:mb-0">{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 mr-2" />
              <span className="text-xs text-gray-500">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about schedule..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartAssistant;
