import api from './api';

export const getLiveStatus = async () => {
  try {
    const response = await api.get('/livestream/status/');
    return response.data; // Expected: { isLive: true, videoId: 'abc123', title: '...' }
  } catch (error) {
    console.error("Error fetching live status", error);
    return { isLive: false };
  }
};