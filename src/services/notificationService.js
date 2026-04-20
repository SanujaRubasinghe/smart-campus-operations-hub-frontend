import api from './api';

export const getNotifications = async (page = 0, size = 20) => {
    const response = await api.get(`/api/notifications?page=${page}&size=${size}`);
    const embedded = response.data._embedded;
    // collectionRelation = "notifications" set via @Relation on NotificationModel
    return {
        notifications: embedded
            ? (embedded.notifications || embedded.notificationModelList || embedded.notificationList || [])
            : [],
        page: response.data.page || {},
    };
};

export const getUnreadCount = async () => {
    const response = await api.get('/api/notifications/unread-count');
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await api.patch(`/api/notifications/${id}/read`);
    return response.data;
};
