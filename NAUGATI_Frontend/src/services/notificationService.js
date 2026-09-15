import { MARITIME_ALERTS, DATA_METADATA } from './demoData';

let localAlerts = [...MARITIME_ALERTS];

export const notificationService = {
  getMetadata() {
    return DATA_METADATA;
  },

  async getAlerts(filterCategory = 'All') {
    let list = [...localAlerts];
    if (filterCategory && filterCategory !== 'All') {
      list = list.filter(a => a.category.toLowerCase() === filterCategory.toLowerCase());
    }
    return {
      metadata: DATA_METADATA,
      alerts: list,
      unreadCount: list.length
    };
  },

  markAsRead(id) {
    localAlerts = localAlerts.filter(a => a.id !== id);
    return { success: true };
  }
};
