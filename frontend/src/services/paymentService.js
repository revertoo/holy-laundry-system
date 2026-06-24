import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const paymentService = {
  async createPaymentToken(orderId) {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
      `${API_URL}/api/payments/create-token/${orderId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async getPaymentHistory(customerId) {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(
      `${API_URL}/api/payments/history/${customerId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  openMidtransSnap(snapToken, onSuccess, onPending, onError) {
    if (!window.snap) {
      console.error('Midtrans Snap not loaded');
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: function (result) {
        console.log('Payment success:', result);
        if (onSuccess) onSuccess(result);
      },
      onPending: function (result) {
        console.log('Payment pending:', result);
        if (onPending) onPending(result);
      },
      onError: function (result) {
        console.log('Payment error:', result);
        if (onError) onError(result);
      },
      onClose: function () {
        console.log('Payment popup closed');
      },
    });
  },
};