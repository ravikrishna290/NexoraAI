import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Send, X, Bot, HelpCircle, FileCheck2, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
  evidence?: string[];
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'AI',
      text: 'Greetings Safety Officer. I am the Nexora Industrial AI Co-Pilot. I continuously monitor SCADA telemetry, work permits, and regulatory compliance. How can I assist your decision-making?',
      timestamp: '16:54:00',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'USER',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Generate immediate XAI answer
    setTimeout(() => {
      let aiText = '';
      let evidence: string[] = [];

      if (text.toLowerCase().includes('reject') || text.toLowerCase().includes('why')) {
        aiText = 'Permit PTW-2026-8409 was rejected due to a CRITICAL Compound Risk Score (96%). LEL Gas Sensor G-104 read 22.4% LEL within 8m of the requested welding location, directly violating OISD-STD-105 Section 6.2.';
        evidence = ['OISD-STD-105 Sec 6.2 (Hot Work Prohibition)', 'Sensor G-104 (22.4% LEL)', 'INC-2021-04-12 Vector Match (89%)'];
      } else if (text.toLowerCase().includes('simple') || text.toLowerCase().includes('operator')) {
        aiText = 'In simple terms: Welding creates sparks. There is a dangerous gas leak right next to where welding was requested. If welding starts, the gas will catch fire and explode.';
        evidence = ['High Explosive Hazard Zone B4'];
      } else {
        aiText = 'All multi-agent domain factors have been evaluated. SCADA telemetry indicates elevated pressure (142.8 Bar) and vibration anomalies on Pump P-102. SCADA Nitrogen purge protocol ISO-HC2-09 is ready for execution.';
        evidence = ['Pump P-102 Vibration (8.4 mm/s)', 'OSHA 1910.119 Compliance'];
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          evidence,
        },
      ]);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex justify-end">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-brand-blue/20 border border-brand-blue flex items-center justify-center text-brand-blue">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  NEXORA AI INDUSTRIAL COPILOT <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Always-On Safety Intelligence</span>
              </div>
            </div>

            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSend('Why was Permit PTW-8409 rejected?')}
              className="text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-brand-cyan px-2.5 py-1 rounded border border-slate-700"
            >
              Why permit rejected?
            </button>
            <button
              onClick={() => handleSend('Explain in simple language for field operators')}
              className="text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded border border-slate-700"
            >
              Explain simple terms
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[85%] space-y-1.5 ${
                    msg.sender === 'USER'
                      ? 'bg-brand-blue text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {msg.evidence && (
                    <div className="pt-2 border-t border-slate-700/80 space-y-1 font-mono text-[10px]">
                      <span className="text-brand-cyan font-bold block">EVIDENCE & CITATIONS:</span>
                      {msg.evidence.map((e, i) => (
                        <div key={i} className="text-slate-300">• {e}</div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask AI Copilot about risk, SOPs, permits..."
              className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-100 px-3 py-2 rounded-md focus:outline-none focus:border-brand-blue"
            />
            <Button variant="primary" size="sm" onClick={() => handleSend()} icon={<Send className="w-3.5 h-3.5" />}>
              Send
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
