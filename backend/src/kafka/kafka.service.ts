import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;
  private consumers: Consumer[] = [];

  constructor(private readonly config: ConfigService) {
    const brokers = this.config?.get?.('KAFKA_BROKERS') || process.env.KAFKA_BROKERS;
    if (brokers && process.env.NODE_ENV !== 'test') {
      this.kafka = new Kafka({
        clientId: 'specpart-backend',
        brokers: brokers.split(','),
        retry: {
          initialRetryTime: 1000,
          retries: 3,
        },
      });
      this.producer = this.kafka.producer();
    }
  }

  async onModuleInit() {
    if (!this.producer) {
      this.logger.log('Kafka brokers not configured or test environment — skipping Kafka initialization');
      return;
    }
    try {
      await this.producer.connect();
      this.isConnected = true;
      this.logger.log('Kafka Producer connected');
    } catch (err) {
      this.logger.warn(`Failed to connect to Kafka: ${(err as Error).message}. Events will not be published.`);
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.consumers?.length) {
      await Promise.all(this.consumers.map(c => c.disconnect().catch(() => {})));
    }
    if (this.isConnected && this.producer) {
      await this.producer.disconnect().catch(() => {});
    }
  }

  async produce(topic: string, key: string, message: any): Promise<void> {
    if (!this.producer || !this.isConnected) {
      this.logger.debug(`Kafka not connected. Skipping message for topic ${topic}`);
      return;
    }
    
    try {
      await this.producer.send({
        topic,
        messages: [
          { key, value: JSON.stringify(message) },
        ],
      });
      this.logger.debug(`Produced message to ${topic} [${key}]`);
    } catch (err) {
      this.logger.error(`Error producing to ${topic}: ${(err as Error).message}`);
    }
  }

  async createConsumer(groupId: string, topics: string[], eachMessage: (payload: any) => Promise<void>) {
    if (!this.kafka || process.env.NODE_ENV === 'test') {
      return;
    }
    const consumer = this.kafka.consumer({ groupId });
    this.consumers.push(consumer);

    try {
      await consumer.connect();
      for (const topic of topics) {
        await consumer.subscribe({ topic, fromBeginning: false });
      }
      
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          this.logger.debug(`Received message from ${topic} [${message.key?.toString()}]`);
          try {
            const payload = JSON.parse(message.value?.toString() || '{}');
            await eachMessage(payload);
          } catch (err) {
            this.logger.error(`Error processing message from ${topic}: ${(err as Error).message}`);
          }
        },
      });
      this.logger.log(`Kafka Consumer (${groupId}) connected and subscribed to ${topics.join(', ')}`);
    } catch (err) {
      this.logger.warn(`Kafka Consumer (${groupId}) failed to connect: ${(err as Error).message}`);
    }
  }
}
