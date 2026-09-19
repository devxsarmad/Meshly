export interface NotificationLog { id: string; eventName: string; userId: string; orderId: string; channel: 'email' | 'sms'; recipient: string; message: string; createdAt: string; }
