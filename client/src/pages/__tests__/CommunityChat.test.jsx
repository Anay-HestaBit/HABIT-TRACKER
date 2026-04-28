import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import CommunityChat from '../CommunityChat';
import api from '../../api/axios';

const socketHandlers = {};
const socketMock = {
  connected: true,
  emit: vi.fn(),
  on: vi.fn((event, handler) => {
    socketHandlers[event] = handler;
  }),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: () => socketMock,
}));

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'user-1' },
  }),
}));

const renderChat = () => render(
  <MemoryRouter initialEntries={['/community/comm-1/chat']}>
    <ToastProvider>
      <Routes>
        <Route path="/community/:id/chat" element={<CommunityChat />} />
      </Routes>
    </ToastProvider>
  </MemoryRouter>
);

describe('CommunityChat', () => {
  beforeEach(() => {
    socketMock.emit.mockClear();
    socketMock.on.mockClear();
    socketMock.disconnect.mockClear();
    socketMock.connected = true;
    api.get.mockReset();
    api.post.mockReset();
  });

  it('renders chat messages and handles moderation + send', async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          _id: 'comm-1',
          name: 'Focus Crew',
          members: [{ userId: { _id: 'user-1', username: 'owner' }, role: 'owner' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          messages: [
            {
              _id: 'msg-1',
              content: 'Hello team',
              createdAt: new Date().toISOString(),
              userId: { _id: 'user-2', username: 'alex' },
            },
          ],
          canModerate: true,
        },
      });

    api.post.mockResolvedValue({ data: {} });
    socketMock.emit.mockImplementation((event, payload, ack) => {
      if (event === 'sendMessage' && typeof ack === 'function') {
        ack({
          ok: true,
          message: {
            _id: 'msg-2',
            content: payload.content,
            createdAt: new Date().toISOString(),
            userId: { _id: 'user-1', username: 'owner' },
          },
        });
      }
    });

    renderChat();

    expect(await screen.findByText('Focus Crew')).toBeInTheDocument();
    expect(screen.getByText('Hello team')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Hide' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/communities/comm-1/chat/msg-1/hide');
    });

    const input = screen.getByPlaceholderText('Message');
    await user.type(input, 'New message');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(socketMock.emit).toHaveBeenCalledWith(
      'sendMessage',
      {
        communityId: 'comm-1',
        content: 'New message',
      },
      expect.any(Function)
    );

    socketHandlers.chatMessage({
      _id: 'msg-2',
      content: 'Live update',
      createdAt: new Date().toISOString(),
      userId: { _id: 'user-3', username: 'jane' },
    });

    expect(await screen.findByText('Live update')).toBeInTheDocument();
  });
});
