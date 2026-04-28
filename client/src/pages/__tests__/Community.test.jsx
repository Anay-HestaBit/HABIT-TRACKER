import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import Community from '../Community';
import api from '../../api/axios';

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const renderCommunity = () => render(
  <MemoryRouter>
    <ToastProvider>
      <Community />
    </ToastProvider>
  </MemoryRouter>
);

describe('Community approvals', () => {
  it('shows approval requests and approves a member', async () => {
    const approvals = [
      {
        _id: 'comm-1',
        name: 'Focus Crew',
        inviteCode: 'FOCUS1',
        pendingRequests: [{ userId: { _id: 'user-1', username: 'requester' } }],
      },
    ];

    api.get
      .mockResolvedValueOnce({ data: { communities: [], pending: [], approvals } })
      .mockResolvedValueOnce({ data: { communities: [], pending: [], approvals: [] } });

    api.post.mockResolvedValueOnce({ data: { message: 'Request approved' } });

    renderCommunity();

    expect(await screen.findByText('Requests to approve')).toBeInTheDocument();
    expect(screen.getByText('Focus Crew')).toBeInTheDocument();
    expect(screen.getByText('requester')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/communities/comm-1/approve', { userId: 'user-1' });
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
});
