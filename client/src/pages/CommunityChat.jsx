import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, ShieldOff, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const CommunityChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [canModerate, setCanModerate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef(null);
  const typingUsersTimeoutsRef = useRef({});

  const socket = useMemo(() => io('/', { withCredentials: true }), []);

  const isAdmin = community && user
    ? community.members?.some((member) => {
      const memberId = member.userId?._id || member.userId;
      return String(memberId) === String(user._id) && (member.role === 'admin' || member.role === 'owner');
    })
    : false;

  const loadChat = async () => {
    setLoading(true);
    try {
      const [communityRes, chatRes] = await Promise.all([
        api.get(`/communities/${id}`),
        api.get(`/communities/${id}/chat`, { params: { limit: 60 } })
      ]);
      setCommunity(communityRes.data);
      setMessages(chatRes.data.messages || []);
      setCanModerate(Boolean(chatRes.data.canModerate));
    } catch (err) {
      const status = err.response?.status;
      if (status === 403 || status === 401) {
        pushToast({
          type: 'warning',
          title: 'Access required',
          message: err.response?.data?.message || 'You need to join this community first.'
        });
        navigate('/community');
      } else {
        pushToast({
          type: 'error',
          title: 'Chat unavailable',
          message: err.response?.data?.message || 'Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChat();
  }, [id]);

  useEffect(() => {
    socket.emit('joinCommunity', { communityId: id });

    socket.on('chatMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('typing', ({ userId, isTyping }) => {
      if (!userId || String(userId) === String(user?._id)) return;

      if (typingUsersTimeoutsRef.current[userId]) {
        clearTimeout(typingUsersTimeoutsRef.current[userId]);
      }

      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) {
          next[userId] = true;
        } else {
          delete next[userId];
        }
        return next;
      });

      if (isTyping) {
        typingUsersTimeoutsRef.current[userId] = setTimeout(() => {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[userId];
            return next;
          });
          delete typingUsersTimeoutsRef.current[userId];
        }, 3000);
      } else {
        delete typingUsersTimeoutsRef.current[userId];
      }
    });

    socket.on('errorMessage', (payload) => {
      pushToast({ type: 'error', title: 'Chat error', message: payload.message });
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      Object.values(typingUsersTimeoutsRef.current).forEach(clearTimeout);
      typingUsersTimeoutsRef.current = {};
      socket.disconnect();
    };
  }, [id, socket, pushToast, user?._id]);

  const formatDayLabel = (dateValue) => {
    const date = new Date(dateValue);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const shouldShowDaySeparator = (message, index) => {
    if (index === 0) return true;
    const current = new Date(message.createdAt).toDateString();
    const previous = new Date(messages[index - 1].createdAt).toDateString();
    return current !== previous;
  };

  const getMemberName = (userId) => {
    const member = community?.members?.find((item) => {
      const memberId = item.userId?._id || item.userId;
      return String(memberId) === String(userId);
    });
    return member?.userId?.username || 'Someone';
  };

  const typingNames = Object.keys(typingUsers).map(getMemberName);

  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socket.emit('typing', { communityId: id, isTyping: false });
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    socket.emit('typing', { communityId: id, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1200);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setProcessing(true);
    try {
      socket.emit('sendMessage', { communityId: id, content: newMessage });
      setNewMessage('');
      stopTyping();
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Send failed',
        message: 'Please try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleHide = async (messageId, hidden) => {
    try {
      await api.post(`/communities/${id}/chat/${messageId}/${hidden ? 'hide' : 'unhide'}`);
      setMessages((prev) => prev.map((msg) => msg._id === messageId ? { ...msg, isHidden: hidden } : msg));
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Update failed',
        message: err.response?.data?.message || 'Try again.'
      });
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await api.post(`/communities/${id}/chat/${messageId}/delete`);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Delete failed',
        message: err.response?.data?.message || 'Try again.'
      });
    }
  };

  const handleMute = async (memberId) => {
    try {
      await api.post(`/communities/${id}/chat/mute`, { userId: memberId, minutes: 60 });
      pushToast({ type: 'success', title: 'Member muted', message: 'Muted for 60 minutes.' });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Mute failed',
        message: err.response?.data?.message || 'Try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <MessageSquare className="text-primary" size={36} />
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{community?.name} Chat</h1>
          <p className="text-muted-foreground text-sm">Realtime community updates and support.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/community/${id}`}
            className="px-4 py-2 rounded-xl bg-secondary text-foreground font-bold flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Community
          </Link>
        </div>
      </header>

      <div className="glass p-6 rounded-[2rem] border border-white/10">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
          )}
          {messages.map((msg, index) => (
            <React.Fragment key={msg._id}>
              {shouldShowDaySeparator(msg, index) && (
                <div className="sticky top-0 z-10 flex justify-center py-2">
                  <span className="rounded-full border border-white/10 bg-background/90 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground shadow-lg backdrop-blur">
                    {formatDayLabel(msg.createdAt)}
                  </span>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-2xl border border-white/5 ${msg.isHidden ? 'bg-secondary/20 opacity-70' : 'bg-secondary/40'}`}
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>{msg.userId?.username || 'Member'}</span>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-foreground">{msg.content}</p>
                {canModerate && (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleHide(msg._id, !msg.isHidden)}
                      className="px-3 py-1 rounded-lg bg-secondary text-foreground font-bold text-xs"
                    >
                      {msg.isHidden ? 'Unhide' : 'Hide'}
                    </button>
                    <button
                      onClick={() => handleDelete(msg._id)}
                      className="px-3 py-1 rounded-lg bg-secondary/60 text-foreground font-bold text-xs"
                    >
                      Delete
                    </button>
                    {msg.userId?._id && (
                      <button
                        onClick={() => handleMute(msg.userId._id)}
                        className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-300 font-bold text-xs flex items-center gap-1"
                      >
                        <ShieldOff size={12} /> Mute
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </React.Fragment>
          ))}
        </div>

        <div className="mt-4 min-h-5">
          {typingNames.length > 0 && (
            <p className="text-xs font-semibold text-muted-foreground">
              {typingNames.length === 1 ? `${typingNames[0]} is typing...` : `${typingNames.slice(0, 2).join(', ')} are typing...`}
            </p>
          )}
        </div>

        <form onSubmit={handleSend} className="mt-2 flex gap-3">
          <input
            value={newMessage}
            onChange={handleMessageChange}
            onBlur={stopTyping}
            placeholder="Write a message..."
            className="flex-1 bg-secondary/50 border border-secondary/60 rounded-2xl px-4 py-3 text-foreground"
          />
          <button
            type="submit"
            disabled={processing || !newMessage.trim()}
            className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center gap-2"
          >
            <Send size={16} /> Send
          </button>
        </form>
      </div>

      {isAdmin && community?.members?.length > 0 && (
        <div className="glass p-6 rounded-[2rem] border border-white/10">
          <h2 className="text-lg font-black mb-3">Quick mute</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {community.members.map((member) => (
              <button
                key={member.userId?._id || member.userId}
                onClick={() => handleMute(member.userId?._id || member.userId)}
                className="flex items-center justify-between px-4 py-3 rounded-2xl bg-secondary/40 text-sm font-semibold"
              >
                <span>{member.userId?.username || 'Member'}</span>
                <ShieldOff size={14} className="text-rose-300" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityChat;
