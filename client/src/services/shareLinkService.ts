import api from '@/lib/api';

export interface ShareLinkResponse {
  token: string;
  shareUrl: string;
  expiresAt: string;
  type: 'recommendation' | 'approval';
}

export interface ShareLink {
  _id: string;
  token: string;
  scheduleId: string;
  type: 'recommendation' | 'approval';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
  createdAt: string;
}

class ShareLinkService {
  /**
   * Generate share link
   */
  async generateShareLink(
    scheduleId: string,
    type: 'recommendation' | 'approval'
  ): Promise<ShareLinkResponse> {
    const response = await api.post(`/schedules/${scheduleId}/share`, { type });
    return response.data;
  }

  /**
   * Access share link
   */
  async accessShareLink(token: string): Promise<{ scheduleId: string; redirectUrl: string }> {
    const response = await api.get(`/schedules/share/${token}`);
    return response.data;
  }

  /**
   * Get share links for a schedule
   */
  async getShareLinks(scheduleId: string): Promise<ShareLink[]> {
    const response = await api.get(`/schedules/${scheduleId}/share-links`);
    return response.data;
  }
}

export const shareLinkService = new ShareLinkService();