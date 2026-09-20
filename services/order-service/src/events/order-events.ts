import amqp, { Channel, ChannelModel } from 'amqplib';
import { env } from '../config/env';

let connection: ChannelModel;
let channel: Channel;
export const connectEventBus = async (): Promise<void> => {
  connection = await amqp.connect(env.rabbitmqUrl);
  channel = await connection.createChannel();
  await channel.assertExchange(env.rabbitmqExchange, 'topic', { durable: true });
  await channel.assertQueue(env.orderPaymentQueue, { durable: true });
  for (const routingKey of ['payment.confirmed', 'payment.failed']) await channel.bindQueue(env.orderPaymentQueue, env.rabbitmqExchange, routingKey);
};
export const publishOrderPlaced = async (payload: Record<string, unknown>): Promise<void> => { if (!channel) throw new Error('RabbitMQ channel is not connected'); channel.publish(env.rabbitmqExchange, 'order.placed', Buffer.from(JSON.stringify(payload)), { persistent: true, contentType: 'application/json' }); };
export const consumePaymentEvents = async (handler: (payload: unknown) => Promise<void>): Promise<void> => {
  await channel.consume(env.orderPaymentQueue, async (message) => {
    if (!message) return;
    try { await handler(JSON.parse(message.content.toString()) as unknown); channel.ack(message); }
    catch (error) { console.error('Payment event handling failed', error); channel.nack(message, false, false); }
  });
};
