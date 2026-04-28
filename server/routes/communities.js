const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const communityController = require('../controllers/communityController');

// @route   GET /api/communities
router.get('/', protect, communityController.list.bind(communityController));

// @route   POST /api/communities
router.post('/', protect, communityController.create.bind(communityController));

// @route   POST /api/communities/join
router.post('/join', protect, communityController.joinByCode.bind(communityController));

// @route   GET /api/communities/:id
router.get('/:id', protect, communityController.get.bind(communityController));

// @route   POST /api/communities/:id/approve
router.post('/:id/approve', protect, communityController.approve.bind(communityController));

// @route   POST /api/communities/:id/reject
router.post('/:id/reject', protect, communityController.reject.bind(communityController));

// @route   POST /api/communities/:id/role
router.post('/:id/role', protect, communityController.updateRole.bind(communityController));

// @route   POST /api/communities/:id/remove
router.post('/:id/remove', protect, communityController.removeMember.bind(communityController));

// @route   POST /api/communities/:id/leave
router.post('/:id/leave', protect, communityController.leave.bind(communityController));

// @route   GET /api/communities/:id/habits
router.get('/:id/habits', protect, communityController.habits.bind(communityController));

// @route   POST /api/communities/:id/habits
router.post('/:id/habits', protect, communityController.createHabit.bind(communityController));

// @route   POST /api/communities/:id/habits/:habitId/complete
router.post('/:id/habits/:habitId/complete', protect, communityController.completeHabit.bind(communityController));

// @route   POST /api/communities/:id/habits/:habitId/shield
router.post('/:id/habits/:habitId/shield', protect, communityController.useShield.bind(communityController));

// @route   GET /api/communities/:id/leaderboard
router.get('/:id/leaderboard', protect, communityController.leaderboard.bind(communityController));

// @route   GET /api/communities/:id/journal
router.get('/:id/journal', protect, communityController.journal.bind(communityController));

// @route   POST /api/communities/:id/journal
router.post('/:id/journal', protect, communityController.createJournal.bind(communityController));

// @route   POST /api/communities/:id/journal/:entryId/pin
router.post('/:id/journal/:entryId/pin', protect, communityController.pinJournal.bind(communityController));

// @route   POST /api/communities/:id/journal/:entryId/unpin
router.post('/:id/journal/:entryId/unpin', protect, communityController.unpinJournal.bind(communityController));

// @route   POST /api/communities/:id/journal/:entryId/hide
router.post('/:id/journal/:entryId/hide', protect, communityController.hideJournal.bind(communityController));

// @route   POST /api/communities/:id/journal/:entryId/unhide
router.post('/:id/journal/:entryId/unhide', protect, communityController.unhideJournal.bind(communityController));

// @route   GET /api/communities/:id/chat
router.get('/:id/chat', protect, communityController.chat.bind(communityController));

// @route   POST /api/communities/:id/chat
router.post('/:id/chat', protect, communityController.sendChat.bind(communityController));

// @route   POST /api/communities/:id/chat/:messageId/hide
router.post('/:id/chat/:messageId/hide', protect, communityController.hideChat.bind(communityController));

// @route   POST /api/communities/:id/chat/:messageId/unhide
router.post('/:id/chat/:messageId/unhide', protect, communityController.unhideChat.bind(communityController));

// @route   POST /api/communities/:id/chat/:messageId/delete
router.post('/:id/chat/:messageId/delete', protect, communityController.deleteChat.bind(communityController));

// @route   POST /api/communities/:id/chat/mute
router.post('/:id/chat/mute', protect, communityController.muteMember.bind(communityController));

// @route   POST /api/communities/:id/chat/unmute
router.post('/:id/chat/unmute', protect, communityController.unmuteMember.bind(communityController));

module.exports = router;
