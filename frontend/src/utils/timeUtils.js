// Utility function to format relative time
export const getRelativeTime = (dateInput) => {
    if (!dateInput) return 'just now';

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'recently';

    const now = new Date();
    let diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 0) diffInSeconds = 0; // Handle clock skew
    if (diffInSeconds < 5) return 'just now';

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
    }

    return 'just now';
};

// Extract timestamp from MongoDB ObjectId
export const getDateFromId = (id) => {
    if (!id || typeof id !== 'string' || id.length !== 24) return null;
    try {
        const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
        return new Date(timestamp);
    } catch (e) {
        return null;
    }
};
