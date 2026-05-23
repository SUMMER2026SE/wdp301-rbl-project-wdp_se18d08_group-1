import apiClient from '../api/apiClient';

export const adminService = {
    // Users (khách hàng)
    getUsers: () => apiClient.get('/admin/users'),
    blockUser: (id) => apiClient.patch(`/admin/users/${encodeURIComponent(String(id))}/block`),

    // Staff (branchId hoặc branchUUID: lọc theo chi nhánh)
    getStaff: (params) => apiClient.get('/admin/staff', { params }),
    createStaff: (data) => apiClient.post('/admin/staff', data),
    updateStaff: (id, data) => apiClient.put(`/admin/staff/${encodeURIComponent(String(id))}`, data),
    deleteStaff: (id) => apiClient.delete(`/admin/staff/${encodeURIComponent(String(id))}`),
    blockStaff: (id) => apiClient.patch(`/admin/staff/${encodeURIComponent(String(id))}/block`),
    unblockStaff: (id) => apiClient.patch(`/admin/staff/${encodeURIComponent(String(id))}/unblock`),

    // Branches (chi nhánh rạp)
    getBranches: () => apiClient.get('/admin/branches'),
    getBranchDetail: (id) => apiClient.get(`/admin/branches/${encodeURIComponent(String(id))}/detail`),
    createBranch: (data) => apiClient.post('/admin/branches', data),
    updateBranch: (id, data) => apiClient.put(`/admin/branches/${encodeURIComponent(String(id))}`, data),

    // Vouchers (BE: /api/vouchers)
    getVouchers: () => apiClient.get('/vouchers'),
    createVoucher: (data) => apiClient.post('/vouchers', data),
    updateVoucher: (uuid, data) => apiClient.put(`/vouchers/${encodeURIComponent(String(uuid))}`, data),
    deleteVoucher: (uuid) => apiClient.delete(`/vouchers/${encodeURIComponent(String(uuid))}`),

    // Reports
    getMovieRevenue: () => apiClient.get('/admin/reports/movies'),
    getCinemaRevenue: () => apiClient.get('/admin/reports/cinemas'),
    getTopCustomers: (limit = 10) => apiClient.get('/admin/reports/customers/top', { params: { limit } }),

    // Export (trả file, dùng responseType: 'blob')
    exportMovieRevenue: () =>
        apiClient.get('/admin/export/reports/movies', { responseType: 'blob' }),

    // System Settings
    getSystemSettings: () => apiClient.get('/admin/system-settings'),
    updateSystemSettings: (data) => apiClient.put('/admin/system-settings', data),
};
