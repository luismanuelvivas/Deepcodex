'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowPathIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { generateCode, Message } from './services/ai';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('// Your generated code will appear here');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      // Add user message to chat
      const userMessage: Message = {
        role: 'user',
        content: prompt
      };
      setMessages(prev => [...prev, userMessage]);

      const result = await generateCode(prompt);

      // Add assistant message to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.message
      };
      setMessages(prev => [...prev, assistantMessage]);

      setGeneratedCode(result.code);
    } catch (error: any) {
      console.error('Error generating code:', error);
      setGeneratedCode('// Error generating code. Please try again.');
      
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: error.message || 'Failed to generate code. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  return (
    <main className="main-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <button className="sidebar-button">
          <CodeBracketIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="content-area">
        <div className="header">
          <h1>Code Wizard</h1>
          <div>
            <button className="header-button">
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Chat Interface */}
          <div className="chat-section">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <h2>Welcome to Code Wizard AI</h2>
                  <p>Start a conversation to begin</p>
                </div>
              ) : (
                <div className="messages-container">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                    >
                      <div className="message-content">{message.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="chat-input-container">
              <form onSubmit={handleSubmit} className="chat-form">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the code you want to create..."
                  className="chat-input"
                />
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="submit-button"
                >
                  {isGenerating ? (
                    <ArrowPathIcon className="w-5 h-5 loading-icon" />
                  ) : (
                    <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Code Display */}
          <div className="code-section">
            <div>
              <div className="code-header">
                <h2>Generated Code</h2>
              </div>
              <div className="code-editor-container">
                <MonacoEditor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={generatedCode}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 