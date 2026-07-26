import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import client from "../api/client";

export default function Chatbot({ user, isAdmin }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Set dynamic initial message based on user state
    const greeting = user 
      ? `Hi ${user.name}! I am your AI assistant. ${isAdmin ? "I see you have Admin access. " : ""}How can I help you today?`
      : "Hi! I am your AI assistant. How can I help you today?";
      
    // Only set it if we don't already have messages
    if (messages.length === 0 || messages.length === 1) {
      setMessages([{ role: "model", text: greeting }]);
    }
  }, [user, isAdmin]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    // Add user message to state
    const updatedMessages = [...messages, { role: "user", text: userMessage }];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Map UI messages to API format
      const history = messages.map(msg => ({
        role: msg.role === "model" ? "assistant" : "user",
        content: msg.text
      }));

      const { data } = await client.post("/api/chat", { 
        message: userMessage,
        history,
        userName: user?.name 
      });
      
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
      } else if (data.error) {
        setMessages((prev) => [...prev, { role: "model", text: `Error: ${data.error}` }]);
      }
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages((prev) => [...prev, { role: "model", text: "Sorry, I am having trouble connecting to the server right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button and Tooltip Container */}
      <div className="fixed bottom-6 right-6 z-50 flex items-end gap-4">
        {/* Tooltip Bubble */}
        {!isOpen && showTooltip && (
          <div className="relative mb-2 animate-bounce">
            <div className="bg-white text-gray-800 text-sm py-2 px-4 rounded-2xl rounded-br-sm shadow-xl border border-gray-200/50 whitespace-nowrap flex items-center gap-2">
              <span className="font-medium">Hey, how may I help you?</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }} 
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-110"
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[500px] bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden transform transition-all duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <h3 className="font-semibold text-lg">AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "model" && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
                    <Bot size={16} />
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm p-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span className="text-xs text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all text-gray-900"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
