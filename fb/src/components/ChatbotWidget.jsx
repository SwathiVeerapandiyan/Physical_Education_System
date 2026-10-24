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
            message: 'Hi  Welcome to the Department of Physical Education & Sports. How can we assist you today?',
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
      let fallbackText = " I couldn't quite understand your request. Please ask a specific question regarding Ground Bookings, Equipment Rental, User Form, Notice Board, Tournaments, or Gallery, or select one of the options below!";
      if (actionPill) {
        if (actionPill.action === 'ACTION_FAQ') {
          fallbackText = "FAQ Highlights:\n Ground Bookings: Use the Ground Bookings tab.\n Equipment Rental: Use the Equipment tab.\n Hours: Mon-Sat 6 AM to 7 PM.";
        } else if (actionPill.action === 'ACTION_EMAIL') {
          fallbackText = " Official Contact:\nEmail: pe.dept@portal.edu\nPhone: +91 44 2239 0675";
        } else if (actionPill.action === 'ACTION_GOODBYE') {
          fallbackText = "Thank you for visiting Physical Education Portal! Have a great day ahead! ";
        } else if (actionPill.action === 'ACTION_GROUND') {
          fallbackText = " Ground Booking: Select 'Ground Bookings' from sidebar to reserve slots for Football, Cricket, Basketball or Tennis.";
        } else if (actionPill.action === 'ACTION_EQUIPMENT') {
          fallbackText = " Equipment Rental: Request sports gear via the 'Equipment Bookings' dashboard.";
        }
      } else if (text) {
        const lower = text.toLowerCase();
        if (lower.includes("notice") || lower.includes("announcement")) {
          fallbackText = " Notice Board:\nCheck out official department notices, sports announcements, and schedule updates under the 'Notice Board' section in your portal dashboard.";
        } else if (lower.includes("form") || lower.includes("profile") || lower.includes("candidate")) {
          fallbackText = " User Profile Form:\nYou can complete your student profile details, batch info, and athletic specialty under the 'User Form' section in the left sidebar menu.";
        } else if (lower.includes("directory") || lower.includes("user")) {
          fallbackText = " User Directory:\nView registered candidates, system accounts, and athlete profiles under the 'User Directory' section in the sidebar.";
        } else if (lower.includes("family")) {
          fallbackText = " Family Details:\nAssociate emergency contacts and family/sibling occupations under the 'Family Details' tab in the sidebar.";
        } else if (lower.includes("document") || lower.includes("upload") || lower.includes("certificate")) {
          fallbackText = " Document Upload:\nUpload your Aadhar card, medical fitness certificates, and required documents under the 'Document Details' section.";
        } else if (lower.includes("gallery") || lower.includes("media") || lower.includes("photo")) {
          fallbackText = " Gallery & Media:\nBrowse event photos, tournament highlights, and sports media under the 'Gallery & Media' section.";
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
              <div className="mcc-greeting-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8V4H8"></path>
                  <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                  <path d="M2 14h2"></path>
                  <path d="M20 14h2"></path>
                  <path d="M15 13v2"></path>
                  <path d="M9 13v2"></path>
                </svg>
                <span>Hi, Candidate Athlete!</span>
              </div>
              <p className="mcc-greeting-sub">PE & Sports Virtual Assistant</p>
            </div>
            <button className="mcc-close-btn" onClick={() => setIsOpen(false)} title="Close Chat" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Contact Line Call Card */}
          <div className="mcc-contact-card-container">
            <a href="tel:+914422390675" className="mcc-call-pill" title="Call Emergency Contact Line" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>Emergency Sports Line: +91 44 2239 0675</span>
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
                  <div className="mcc-bot-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                      <path d="M12 8V4H8"></path>
                      <circle cx="9" cy="14" r="1"></circle>
                      <circle cx="15" cy="14" r="1"></circle>
                    </svg>
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
                <div className="mcc-bot-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                  </svg>
                </div>
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
              placeholder="Ask a sports or portal question..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              className="mcc-send-btn"
              onClick={() => handleSendMessage(inputMsg)}
              disabled={!inputMsg.trim() || loading}
              title="Send message"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Toggle Button */}
      <button
        className={`mcc-chatbot-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Physical Education AI Chatbot"
        aria-label="Open Chatbot Assistant"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <div className="trigger-icon-content">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
              <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
              <path d="M9.5 13a3.5 3.5 0 0 0 5 0"></path>
            </svg>
            <span className="trigger-badge">AI</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
