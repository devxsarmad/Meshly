import amqp, { Channel, ChannelModel } from 'amqplib';
import { env } from '../config/env';

let channel: Channel;
export const connectConsumer = async (): Promise<void> => { const connection: ChannelModel = await amqp.connect(env.rabbitmqUrl); channel = await connection.createChannel(); await channel.assertExchange(env.rabbitmqExchange, 'topic', { durable: true }); await channel.assertQueue(env.notificationQueue, { durable: true }); for (const routingKey of ['order.placed', 'payment.confirmed', 'payment.failed']) await channel.bindQueue(env.notificationQueue, env.rabbitmqExchange, routingKey); };
export const consumeNotifications = async (handler: (payload: unknown) => Promise<void>): Promise<void> => { await channel.consume(env.notificationQueue, async (message) => { if (!message) return; try { await handler(JSON.parse(message.content.toString()) as unknown); channel.ack(message); } catch (error) { console.error('Notification event handling failed', error); channel.nack(message, false, false); } }); };
