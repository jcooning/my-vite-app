/**
 * Notion API Integration Utility
 * This file handles sending reservation data to Notion.
 * Note: Direct calls from the browser to Notion API are blocked by CORS.
 * This utility is designed to work with a backend proxy.
 */

const BASE_URL = import.meta.env.VITE_PROXY_URL || 'https://wedding-proxy-8byu.onrender.com';
const PROXY_URL = `${BASE_URL}/api/notion`;

// 서버(Render)가 잠에서 깨는 동안 생기는 네트워크 오류·게이트웨이 오류는 잠시 후 다시 시도한다.
const RETRY_DELAYS = [3000, 8000];
const fetchWithRetry = async (url, options) => {
    for (let attempt = 0; ; attempt++) {
        try {
            const response = await fetch(url, options);
            if (![502, 503, 504].includes(response.status) || attempt >= RETRY_DELAYS.length) {
                return response;
            }
        } catch (error) {
            if (attempt >= RETRY_DELAYS.length) throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
    }
};

export const saveReservationToNotion = async (reservationData) => {
    try {
        const response = await fetchWithRetry(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservationData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save to Notion');
        }

        return await response.json();
    } catch (error) {
        console.error('Notion Sync Error:', error);
        throw error;
    }
};

export const updateReservationInNotion = async (pageId, reservationData) => {
    try {
        const response = await fetchWithRetry(`${PROXY_URL}/${pageId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservationData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update in Notion');
        }

        return await response.json();
    } catch (error) {
        console.error('Notion Update Error:', error);
        throw error;
    }
};

export const deleteReservationInNotion = async (pageId) => {
    try {
        const response = await fetchWithRetry(`${PROXY_URL}/${pageId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete in Notion');
        }

        return await response.json();
    } catch (error) {
        console.error('Notion Delete Error:', error);
        throw error;
    }
};

export const getReservationsFromNotion = async () => {
    try {
        const response = await fetch(PROXY_URL);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch from Notion');
        }
        return await response.json();
    } catch (error) {
        console.error('Notion Fetch Error:', error);
        throw error;
    }
};
