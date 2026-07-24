import React, { useState, useEffect, useRef } from 'react';
import { chatbotService } from '../services/api';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickOptions, setQuickOptions] = useState([
    { id: 'faq', label: 'FAQ', action: 'ACTION_FAQ' },
    { id: 'ground', label: 'Ground Booking', action: 'ACTION_GROUND' },
    { id: 'equipment', label: 'Equipment Rental', action: 'ACTION_EQUIPMENT' },
    { id: 'email', label: 'Send Us Email', action: 'ACTION_EMAIL' },
    { id: 'goodbye', label: 'GoodBye', action: 'ACTION_GOODBYE' }
  ]);
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load initial welcome message on mount or open
  useEffect(() => {
    const initChat = async () => {
      try {
        const welcome = await chatbotService.getWelcomeMessage();
        setMessages([
          {
            id: welcome.id || 'welcome-1',
            sender: 'bot',
            message: welcome.message || 'Welcome to Department of Physical Education & Sports!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            options: welcome.suggestedOptions || []
          }
        ]);
        if (welcome.suggestedOptions && welcome.suggestedOptions.length > 0) {
          setQuickOptions(welcome.suggestedOptions);
        }
      } catch (err) {
        // Fallback welcome if backend is offline
        setMessages([
          {
            id: 'fallback-1',
            sender: 'bot',
            message: 'Hi ✋ Welcome to Department of Physical Education & Sports. How can we help you today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    };

    if (messages.length === 0) {
      initChat();
    }
  }, []);

  const handleSendMessage = async (textToSend, actionPill = null) => {
    const text = textToSend || inputMsg;
    if (!text.trim() && !actionPill) return;

    const userMessageObj = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      message: actionPill ? actionPill.label : text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setInputMsg('');
    setLoading(true);

    try {
      const payload = {
        sessionId,
        message: text,
        quickOption: actionPill ? actionPill.action : null
      };

      const response = await chatbotService.sendMessage(payload);

      const botReply = {
        id: response.id || 'bot_' + Date.now(),
        sender: 'bot',
        message: response.message,
        timestamp: new Date(response.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: response.suggestedOptions || []
      };

      setMessages((prev) => [...prev, botReply]);
      if (response.suggestedOptions && response.suggestedOptions.length > 0) {
        setQuickOptions(response.suggestedOptions);
      }
    } catch (error) {
      // Local fallback simulation if server is unreachable
      let fallbackText = "❓ I couldn't quite understand your request. Please ask a specific question regarding Ground Bookings, Equipment Rental, User Form, Notice Board, Tournaments, or Gallery, or select one of the options below!";
      if (actionPill) {
        if (actionPill.action === 'ACTION_FAQ') {
          fallbackText = "FAQ Highlights:\n• Ground Bookings: Use the Ground Bookings tab.\n• Equipment Rental: Use the Equipment tab.\n• Hours: Mon-Sat 6 AM to 7 PM.";
        } else if (actionPill.action === 'ACTION_EMAIL') {
          fallbackText = "📧 Official Contact:\nEmail: pe.dept@portal.edu\nPhone: +91 44 2239 0675";
        } else if (actionPill.action === 'ACTION_GOODBYE') {
          fallbackText = "Thank you for visiting Physical Education Portal! Have a great day ahead! 🏆";
        } else if (actionPill.action === 'ACTION_GROUND') {
          fallbackText = "🏟️ Ground Booking: Select 'Ground Bookings' from sidebar to reserve slots for Football, Cricket, Basketball or Tennis.";
        } else if (actionPill.action === 'ACTION_EQUIPMENT') {
          fallbackText = "🏀 Equipment Rental: Request sports gear via the 'Equipment Bookings' dashboard.";
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          sender: 'bot',
          message: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (option) => {
    handleSendMessage(option.label, option);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage(inputMsg);
    }
  };

  return (
    <div className="mcc-chatbot-container">
      {/* Floating Widget Drawer Window */}
      {isOpen && (
        <div className="mcc-chatbot-window">
          {/* Header Banner - MCC Deep Maroon Style */}
          <div className="mcc-chatbot-header">
            <div className="mcc-header-greeting">
              <div className="mcc-greeting-title">
                Hi <span className="waving-hand">✋</span>
              </div>
              <p className="mcc-greeting-sub">Welcome to PE & Sports Portal</p>
            </div>
            <button className="mcc-close-btn" onClick={() => setIsOpen(false)} title="Close Chat">
              ✕
            </button>
          </div>

          {/* Contact Line Call Card */}
          <div className="mcc-contact-card-container">
            <a href="tel:+914422390675" className="mcc-call-pill" title="Call Emergency Contact Line">
              <span className="mcc-phone-icon">📞</span>
            </a>
          </div>

          {/* Quick Option Pill Buttons */}
          <div className="mcc-quick-options-container">
            {quickOptions.map((opt) => (
              <button
                key={opt.id || opt.action}
                className="mcc-option-pill-btn"
                onClick={() => handleOptionClick(opt)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Interactive Chat Log */}
          <div className="mcc-chat-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`mcc-message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}>
                {msg.sender === 'bot' && (
                  <div className="mcc-bot-avatar">
                    <span role="img" aria-label="bot">🎓</span>
                  </div>
                )}
                <div className={`mcc-message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                  <div className="mcc-message-text">{msg.message}</div>
                  <div className="mcc-message-time">{msg.timestamp}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="mcc-message-row bot-row">
                <div className="mcc-bot-avatar">🎓</div>
                <div className="mcc-message-bubble bot-bubble typing-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer Form */}
          <div className="mcc-chat-footer">
            <input
              type="text"
              className="mcc-chat-input"
              placeholder="Ask a question..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              className="mcc-send-btn"
              onClick={() => handleSendMessage(inputMsg)}
              disabled={!inputMsg.trim() || loading}
            >
              ➔
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Toggle Button */}
      <button
        className={`mcc-chatbot-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Physical Education Chatbot"
      >
        {isOpen ? (
          <span className="trigger-close-icon">✕</span>
        ) : (
          <div className="trigger-icon-content">
            <span className="trigger-chat-icon">💬</span>
            <span className="trigger-badge">1</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
