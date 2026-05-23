/**
 * Format number to Vietnamese Dong (VND)
 * @param {number} amount 
 * @returns {string}
 */
export const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

/**
 * Format date to local Vietnamese format
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(date));
};
