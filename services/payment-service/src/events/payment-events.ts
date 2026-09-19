import amqp, { Channel, ChannelModel } from 'amqplib';
import { env } from '../config/env';

let channel: Channel;
export const connectEventBus = async (): Promise<void> => { const connection: ChannelModel = await amqp.connect(env.rabbitmqUrl); channel = await connection.createChannel(); await channel.assertExchange(env.rabbitmqExchange, 'topic', { durable: true }); await channel.assertQueue(env.paymentQueue, { durable: true }); await channel.bindQueue(env.paymentQueue, env.rabbitmqExchange, 'order.placed'); };
export const consumeOrderPlaced = async (handler: (payload: unknown) => Promise<void>): Promise<void> => { await channel.consume(env.paymentQueue, async (message) => { if (!message) return; try { await handler(JSON.parse(message.content.toString()) as unknown); channel.ack(message); } catch (error) { console.error('OrderPlaced handling failed', error); channel.nack(message, false, false); } }); };
export const publishPaymentEvent = (routingKey: 'payment.confirmed' | 'payment.failed', payload: Record<string, unknown>): void => { channel.publish(env.rabbitmqExchange, routingKey, Buffer.from(JSON.stringify(payload)), { persistent: true, contentType: 'application/json' }); };
