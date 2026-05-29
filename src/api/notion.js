/**
 * Notion API Integration Utility
 * This file handles sending reservation data to Notion.
 * Note: Direct calls from the browser to Notion API are blocked by CORS.
 * This utility is designed to work with a backend proxy.
 */

const BASE_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';
const PROXY_URL = `${BASE_URL}/api/notion`;

export const saveReservationToNotion = async (reservationData) => {
    try {
        const response = await fetch(PROXY_URL, {
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
        const response = await fetch(`${PROXY_URL}/${pageId}`, {
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
        const response = await fetch(`${PROXY_URL}/${pageId}`, {
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
