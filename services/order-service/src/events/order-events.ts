import amqp, { Channel, ChannelModel } from 'amqplib';
import { env } from '../config/env';

let connection: ChannelModel;
let channel: Channel;
export const connectEventBus = async (): Promise<void> => { connection = await amqp.connect(env.rabbitmqUrl); channel = await connection.createChannel(); await channel.assertExchange(env.rabbitmqExchange, 'topic', { durable: true }); };
export const publishOrderPlaced = async (payload: Record<string, unknown>): Promise<void> => { if (!channel) throw new Error('RabbitMQ channel is not connected'); channel.publish(env.rabbitmqExchange, 'order.placed', Buffer.from(JSON.stringify(payload)), { persistent: true, contentType: 'application/json' }); };
