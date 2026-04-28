import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCheck, MessageSquare, MoreVertical, Send, ShieldOff, Users } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const getSocketUrl = () => {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
  if (!configuredUrl) return '/';

  return configuredUrl
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '');
};

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
  const messagesEndRef = useRef(null);

  const socket = useMemo(() => io(getSocketUrl(), {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    timeout: 8000,
  }), []);

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

  const appendMessage = (message) => {
    if (!message?._id) return;
    setMessages((prev) => {
      if (prev.some((item) => item._id === message._id)) return prev;
      return [...prev, message];
    });
  };

  useEffect(() => {
    socket.emit('joinCommunity', { communityId: id });

    socket.on('chatMessage', (message) => {
      appendMessage(message);
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

    socket.on('connect_error', (err) => {
      pushToast({
        type: 'error',
        title: 'Realtime offline',
        message: err.message || 'Chat will retry in the background.',
      });
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
  const memberCount = community?.members?.length || 0;

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, typingNames.length]);

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
    const content = newMessage.trim();
    if (!content) return;
    setProcessing(true);
    try {
      await new Promise((resolve, reject) => {
        if (!socket.connected) {
          reject(new Error('Realtime connection is not ready.'));
          return;
        }

        const timer = setTimeout(() => {
          reject(new Error('Realtime send timed out.'));
        }, 8000);

        socket.emit('sendMessage', { communityId: id, content }, (response) => {
          clearTimeout(timer);
          if (response?.ok) {
            resolve(response.message);
          } else {
            reject(new Error(response?.message || 'Message failed.'));
          }
        });
      });
      setNewMessage('');
      stopTyping();
    } catch (err) {
      try {
        const { data } = await api.post(`/communities/${id}/chat`, { content });
        appendMessage(data);
        setNewMessage('');
        stopTyping();
        pushToast({
          type: 'warning',
          title: 'Sent without realtime',
          message: 'Message saved. Realtime is reconnecting.',
        });
      } catch (fallbackErr) {
        pushToast({
          type: 'error',
          title: 'Send failed',
          message: fallbackErr.response?.data?.message || err.message || 'Please try again.',
        });
      }
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
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-background shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-secondary/70 px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={`/community/${id}`}
              className="rounded-full p-2 text-foreground transition-colors hover:bg-white/10"
              aria-label="Back to community"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-foreground shadow-lg shadow-primary/20">
              {community?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-black text-foreground">{community?.name}</h1>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Users size={13} /> {memberCount} members
                {typingNames.length > 0 && (
                  <span className="text-primary">
                    · {typingNames.length === 1 ? `${typingNames[0]} typing...` : `${typingNames.slice(0, 2).join(', ')} typing...`}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10" aria-label="Chat menu">
            <MoreVertical size={20} />
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }} />
          <div className="relative flex h-[62vh] min-h-[480px] flex-col">
            <div className="flex-1 space-y-2 overflow-y-auto px-4 py-5 md:px-8">
              {messages.length === 0 && (
                <div className="mx-auto mt-10 max-w-sm rounded-2xl bg-secondary/70 px-5 py-4 text-center text-sm text-muted-foreground">
                  No messages yet. Start the conversation.
                </div>
              )}
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => {
                  const senderId = msg.userId?._id || msg.userId;
                  const isMine = String(senderId) === String(user?._id);

                  return (
                    <React.Fragment key={msg._id}>
                      {shouldShowDaySeparator(msg, index) && (
                        <div className="sticky top-2 z-10 flex justify-center py-2">
                          <span className="rounded-lg bg-secondary/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground shadow-lg backdrop-blur">
                            {formatDayLabel(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`group w-fit max-w-[82%] rounded-2xl px-3.5 py-2 shadow-md md:max-w-[68%] ${
                          isMine
                            ? 'rounded-tr-md bg-primary text-primary-foreground'
                            : 'rounded-tl-md bg-secondary/80 text-foreground'
                        } ${msg.isHidden ? 'opacity-60' : ''}`}
                        >
                          {!isMine && (
                            <p className="mb-1 text-[12px] font-black text-primary">{msg.userId?.username || 'Member'}</p>
                          )}
                          <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{msg.content}</p>
                          <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isMine ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMine && <CheckCheck size={14} />}
                          </div>
                          {canModerate && (
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                              <button
                                onClick={() => handleHide(msg._id, !msg.isHidden)}
                                className="rounded-full bg-black/10 px-2.5 py-1 text-[11px] font-bold text-current hover:bg-black/20"
                              >
                                {msg.isHidden ? 'Unhide' : 'Hide'}
                              </button>
                              <button
                                onClick={() => handleDelete(msg._id)}
                                className="rounded-full bg-black/10 px-2.5 py-1 text-[11px] font-bold text-current hover:bg-black/20"
                              >
                                Delete
                              </button>
                              {msg.userId?._id && (
                                <button
                                  onClick={() => handleMute(msg.userId._id)}
                                  className="flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-1 text-[11px] font-bold text-rose-100 hover:bg-rose-500/30"
                                >
                                  <ShieldOff size={11} /> Mute
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-white/10 bg-secondary/70 px-4 py-3 backdrop-blur">
              <input
                value={newMessage}
                onChange={handleMessageChange}
                onBlur={stopTyping}
                placeholder="Message"
                className="min-w-0 flex-1 rounded-full border border-white/5 bg-background/70 px-5 py-3 text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
              />
              <button
                type="submit"
                disabled={processing || !newMessage.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:translate-y-0 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>

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
