import api from "../utils/api";

export const orderService = {
    async createOrder(orderData) {
        const response = await api.post('/api/orders', orderData);
        return response.data;
    },

    async getAllOrders() {
        const response = await api.get('/api/orders');
        return response.data;
    },

    async getCustomerOrders(customerId) {
        const response = await api.get('/api/orders/customer/${customerId}');
        return response.data;
    },

    async getOrderById(orderId) {
        const response = await api.get(`/api/orders/${orderId}`);
        return response.data;
    },

    async updateOrderStatus(orderId, status) {
        const response = await api.put('/api/orders/${orderId}/status', {
            status_cucian: status,
        });
        return response.data;
    },

    async deleteOrder(orderId) {
        const response = await api.delete('/api/orders/${orderId}');
        return response.data;
    },

    async validateLocation(latitude, longitude) {
        const response = await api.post('/api/customer/validate-location', {
            latitude,
            longitude,
        });
        return response.data;
    },
};