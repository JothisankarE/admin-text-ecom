import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatQueries.css';
import { toast } from 'react-toastify';
import { url } from '../../assets/assets';

const ChatQueries = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch all chats
    const fetchChats = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const response = await axios.get(`${url}/api/chat/list`);
            if (response.data.success) {
                const newChats = response.data.data;
                setChats(newChats);

                // If a chat is selected, update it with the new data to show incoming messages
                if (selectedChat) {
                    const updatedSelectedChat = newChats.find(c => c._id === selectedChat._id);
                    if (updatedSelectedChat) {
                        // Only update if there are changes to avoid unnecessary re-renders or scroll jumps
                        if (JSON.stringify(updatedSelectedChat.messages) !== JSON.stringify(selectedChat.messages) || updatedSelectedChat.status !== selectedChat.status) {
                            setSelectedChat(updatedSelectedChat);
                            // Scroll to bottom if new message arrived
                            setTimeout(() => {
                                const chatContainer = document.querySelector('.chat-history');
                                if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
                            }, 100);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            if (!isBackground) toast.error("Error fetching chats");
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
        // Poll for new messages every 3 seconds
        const interval = setInterval(() => fetchChats(true), 3000);
        return () => clearInterval(interval);
    }, [selectedChat]); // Add selectedChat to dependency to ensure we have the latest ref for comparison

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        // Scroll to bottom of chat
        setTimeout(() => {
            const chatContainer = document.querySelector('.chat-history');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }, 100);
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedChat) return;

        try {
            const response = await axios.post(`${url}/api/chat/reply`, {
                chatId: selectedChat._id,
                text: replyText
            });

            if (response.data.success) {
                toast.success("Reply sent");
                setReplyText("");
                // Refresh chats and update selected chat
                fetchChats();
                // Optimistically update UI
                setSelectedChat(prev => ({
                    ...prev,
                    messages: [...prev.messages, { sender: 'admin', text: replyText, timestamp: Date.now() }]
                }));
            } else {
                toast.error("Error sending reply");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error sending reply");
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!selectedChat) return;
        try {
            const response = await axios.post(`${url}/api/chat/status`, {
                chatId: selectedChat._id,
                status: newStatus
            });
            if (response.data.success) {
                toast.success(`Chat marked as ${newStatus}`);
                fetchChats();
                setSelectedChat(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating status");
        }
    };

    return (
        <div className='chat-queries-container'>
            <div className="chat-sidebar">
                <div className="sidebar-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
                    <h3 style={{ margin: 0, border: 'none', background: 'transparent', padding: 0 }}>Customer Queries</h3>
                    <button
                        onClick={() => fetchChats()}
                        className={`refresh-btn ${loading ? 'loading' : ''}`}
                        title="Refresh Queries"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 12C21 16.9706 16.9706 21 12 21C9.69613 21 7.5931 20.134 5.97858 18.6667" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M3 12C3 7.02944 7.02944 3 12 3C14.3039 3 16.4069 3.86597 18.0214 5.33333" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M21 3V8H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 21V16H8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Refresh Data</span>
                    </button>
                </div>
                <div className="chat-list">
                    {loading ? <p>Loading...</p> : chats.map(chat => (
                        <div
                            key={chat._id}
                            className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''} ${chat.status === 'Resolved' ? 'resolved' : ''}`}
                            onClick={() => handleSelectChat(chat)}
                        >
                            <div className="chat-item-header">
                                <span className="user-name">{chat.userName || "User"}</span>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {chat.issueType && <span className="status-badge issue">{chat.issueType}</span>}
                                    <span className={`status-badge ${chat.status.toLowerCase().replace(' ', '-')}`}>{chat.status}</span>
                                </div>
                            </div>
                            <p className="last-message">
                                {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : "No messages"}
                            </p>
                            <span className="timestamp">{new Date(chat.lastUpdated).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-window">
                {selectedChat ? (
                    <>
                        <div className="chat-header">
                            <div className="header-info">
                                <h2>{selectedChat.userName || "User"}</h2>
                                <div className="meta-info" style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    <span className="user-id">ID: {selectedChat.userId}</span>
                                    {selectedChat.orderId && (
                                        <span className="order-id" style={{ background: '#f0f4ff', padding: '2px 8px', borderRadius: '4px', color: '#1976d2' }}>
                                            📦 Order: {selectedChat.orderId}
                                        </span>
                                    )}
                                    {selectedChat.issueType && (
                                        <span className="issue-type" style={{ background: '#fff3e0', padding: '2px 8px', borderRadius: '4px', color: '#ef6c00' }}>
                                            🎫 {selectedChat.issueType}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="status-controls">
                                <select
                                    value={selectedChat.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className={`status-select ${selectedChat.status.toLowerCase().replace(' ', '-')}`}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>

                        <div className="chat-history">
                            {selectedChat.messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.sender === 'admin' ? 'admin' : (msg.sender === 'bot' ? 'bot' : 'user')}`}>
                                    <div className="message-content">
                                        {msg.text.startsWith('[TICKET RAISED]') ? (
                                            <div className="ticket-card">
                                                <div className="ticket-header">🎫 New Support Ticket</div>
                                                {msg.text.replace('[TICKET RAISED]', '').trim().split('\n').map((line, i) => {
                                                    const parts = line.split(':');
                                                    if (parts.length >= 2) {
                                                        const label = parts[0].trim();
                                                        const value = parts.slice(1).join(':').trim(); // Join back in case value has colons
                                                        return (
                                                            <div key={i} className="ticket-row">
                                                                <span className="ticket-label">{label}:</span>
                                                                <span className="ticket-value">{value}</span>
                                                            </div>
                                                        );
                                                    }
                                                    return <p key={i}>{line}</p>;
                                                })}
                                            </div>
                                        ) : (
                                            <p>{msg.text}</p>
                                        )}
                                        <span className="time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="chat-input-area">
                            <form onSubmit={handleReply}>
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply..."
                                />
                                <button type="submit">Send</button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Select a conversation to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatQueries;
