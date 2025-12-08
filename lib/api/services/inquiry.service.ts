import { API_ENDPOINTS, API_CONFIG } from '../config';
import { apiClient } from '../client';

export interface CreateInquiryData {
    title: string;
    content: string;
    senderId: string;
    receiverId: string;
}

export const inquiryService = {
    async createInquiry(
        data: CreateInquiryData,
    ): Promise<{ data: any | null; error: Error | null }> {
        console.log('inquiryService.createInquiry: creating inquiry', data);

        const formData = new FormData();
        formData.append('Title', data.title);
        formData.append('Content', data.content);
        formData.append('SenderId', data.senderId);
        formData.append('ReceiverId', data.receiverId);

        try {
            // Get auth token
            let token: string | null = null;
            try {
                if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                    token = localStorage.getItem('token');
                }
            } catch (e) {
                console.error('Failed to get token from localStorage:', e);
            }

            const headers: Record<string, string> = {
                accept: '*/*',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
                console.log('inquiryService: using auth token');
            }

            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CREATE_INQUIRY}`,
                {
                    method: 'POST',
                    headers,
                    body: formData,
                },
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('inquiryService.createInquiry: API error', errorText);
                return {
                    data: null,
                    error: new Error(`Failed to create inquiry: ${response.status}`),
                };
            }

            const result = await response.json();
            console.log('inquiryService.createInquiry: success', result);
            return { data: result, error: null };
        } catch (error: any) {
            console.error('inquiryService.createInquiry: exception', error);
            return { data: null, error };
        }
    },
};
