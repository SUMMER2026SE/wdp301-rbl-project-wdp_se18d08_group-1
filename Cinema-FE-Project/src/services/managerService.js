import apiClient from '../api/apiClient';

export const managerService = {
    // Dashboard & Statistics
    getDashboardStats: () => apiClient.get('/manager/dashboard/summary'),
    getMovieStats: () => apiClient.get('/manager/dashboard/movies'),

    // Movie Management
    getMovies: (params) => apiClient.get('/movies', { params }),
    getMovieById: (id) => apiClient.get(`/movies/${id}`),
    createMovie: (data) => apiClient.post('/movies', data),
    updateMovie: (id, data) => apiClient.put(`/movies/${id}`, data),
    updateTrailer: (id, trailerUrl) => apiClient.patch(`/manager/movies/${id}/trailer`, { trailerUrl }),
    deleteMovie: (id) => apiClient.delete(`/movies/${id}`),

    // Genre Management
    getGenres: () => apiClient.get('/genres'),
    createGenre: (data) => apiClient.post('/genres', data),
    deleteGenre: (id) => apiClient.delete(`/genres/${id}`),

    // Showtime Management
    getShowtimes: (params) => apiClient.get('/showtimes', { params }), // Note: app.ts uses /api/showtimes
    getShowtimeById: (id) => apiClient.get(`/showtimes/${id}`),
    createShowtime: (data) => apiClient.post('/showtimes', data),
    updateShowtime: (id, data) => apiClient.put(`/showtimes/${id}`, data),
    deleteShowtime: (id) => apiClient.delete(`/showtimes/${id}`),

    // Hall & Seat Management
    getHalls: () => apiClient.get('/manager/halls'),
    getHallById: (id) => apiClient.get(`/manager/halls/${id}`),
    createHall: (data) => apiClient.post('/manager/halls', data),
    updateHall: (id, data) => apiClient.put(`/manager/halls/${id}`, data),
    deleteHall: (id) => apiClient.delete(`/manager/halls/${id}`),
    getSeatLayout: (hallId) => apiClient.get(`/manager/halls/${hallId}/layout`),
    setSeatLayout: (hallId, data) => apiClient.post(`/manager/halls/${hallId}/layout`, data),

    // Pricing Management
    getPricingRules: (showtimeId) => apiClient.get(`/manager/pricing/${showtimeId}`),
    setPricingRules: (data) => apiClient.post('/manager/pricing', data),
    deletePricingRules: (showtimeId) => apiClient.delete(`/manager/pricing/${showtimeId}`),

    // News & Promotions
    getNews: () => apiClient.get('/news'),
    createNews: (data) => apiClient.post('/manager/news', data),
    updateNews: (id, data) => apiClient.put(`/manager/news/${id}`, data),
    toggleNewsPublish: (id) => apiClient.patch(`/manager/news/${id}/publish`),
    deleteNews: (id) => apiClient.delete(`/manager/news/${id}`),

    // Banner Management
    getBanners: () => apiClient.get('/banners'),
    createBanner: (data) => apiClient.post('/manager/banners', data),
    updateBanner: (id, data) => apiClient.put(`/manager/banners/${id}`, data),
    toggleBanner: (id) => apiClient.patch(`/manager/banners/${id}/toggle`),
    deleteBanner: (id) => apiClient.delete(`/manager/banners/${id}`),

    // Concession Management (F&B)
    getConcessions: () => apiClient.get('/concessions'),
    createConcession: (data) => apiClient.post('/concessions', data),
    updateConcession: (id, data) => apiClient.put(`/concessions/${id}`, data),
    deleteConcession: (id) => apiClient.delete(`/concessions/${id}`),

    // Review Moderation
    getReviews: (params) => apiClient.get('/reviews', { params }),
    moderateReview: (id, action) => apiClient.patch(`/reviews/${id}/moderate`, { action }),
    deleteReview: (id) => apiClient.delete(`/reviews/${id}`),

    // Export Reports (Authenticated)
    exportDashboardSummary: () => apiClient.get('/manager/dashboard/export', { responseType: 'blob' }),
};
