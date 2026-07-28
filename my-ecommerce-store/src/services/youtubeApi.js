import api from './api';
import axios from 'axios';

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

/**
 * Fetches the current live status from the backend.
 * Called by useYouTube.js every 5 minutes.
 */
export const getLiveStatus = async () => {
  try {
    const response = await api.get('/livestream/status/');
    return response.data;
  } catch (error) {
    console.error('Error fetching live status', error);
    return { isLive: false, videoId: null, title: 'No active stream', broadcastId: null };
  }
};

/**
 * Fetches visible comments for a broadcast.
 * @param {number} broadcastId
 */
export const getBroadcastComments = async (broadcastId) => {
  try {
    const response = await api.get(`/livestream/broadcasts/${broadcastId}/comments/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments', error);
    return [];
  }
};

/**
 * Posts a comment to the live stream.
 * Uses a clean axios instance so that a stale/expired token sitting in
 * localStorage does not get attached and trigger a 400 on AllowAny endpoints.
 * A valid token is forwarded for authenticated users so the backend can resolve
 * request.user and set display_name automatically.
 * @param {number} broadcastId
 * @param {{ message: string, display_name?: string }} data
 */
export const postComment = async (broadcastId, data) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await axios.post(
    `http://localhost:8000/api/livestream/broadcasts/${broadcastId}/comments/`,
    data,
    { headers }
  );
  return response.data;
};


// ─── ADMIN ───────────────────────────────────────────────────────────────────

/** List all broadcasts. */
export const getAllBroadcasts = async () => {
  const response = await api.get('/livestream/broadcasts/');
  return response.data;
};

/** Create a new broadcast. */
export const createBroadcast = async (data) => {
  const response = await api.post('/livestream/broadcasts/', data);
  return response.data;
};

/** Update a broadcast (title, video_id, event, etc.). */
export const updateBroadcast = async (id, data) => {
  const response = await api.patch(`/livestream/broadcasts/${id}/`, data);
  return response.data;
};

/** Delete a broadcast. */
export const deleteBroadcast = async (id) => {
  await api.delete(`/livestream/broadcasts/${id}/`);
};

/**
 * Toggle a broadcast live/offline.
 * @param {number} id
 * @param {boolean} isLive
 */
export const toggleBroadcastLive = async (id, isLive) => {
  const response = await api.post(`/livestream/broadcasts/${id}/toggle/`, { is_live: isLive });
  return response.data;
};

/** Update viewer count manually. */
export const updateViewerCount = async (id, viewerCount) => {
  const response = await api.patch(`/livestream/broadcasts/${id}/viewers/`, { viewer_count: viewerCount });
  return response.data;
};

/** Pull latest comments from YouTube Data API v3 into the database. */
export const syncYouTubeComments = async (broadcastId) => {
  const response = await api.post(`/livestream/broadcasts/${broadcastId}/sync-youtube/`);
  return response.data;
};

/** Admin: fetch all comments (including hidden) optionally filtered by broadcast. */
export const getAdminComments = async (broadcastId = null) => {
  const params = broadcastId ? { broadcast: broadcastId } : {};
  const response = await api.get('/livestream/comments/', { params });
  return response.data;
};

/**
 * Moderate a comment: hide, pin, or highlight.
 * @param {number} commentId
 * @param {{ is_hidden?: boolean, is_pinned?: boolean, is_highlighted?: boolean }} data
 */
export const moderateComment = async (commentId, data) => {
  const response = await api.patch(`/livestream/comments/${commentId}/moderate/`, data);
  return response.data;
};

/** Permanently delete a comment. */
export const deleteComment = async (commentId) => {
  await api.delete(`/livestream/comments/${commentId}/delete/`);
}; 