import * as mqtt from 'mqtt';
import { config } from '../config';
import { PostgresService } from './postgres.service';

export class MqttService {
  private client: mqtt.MqttClient;
  private topic: string;
  private postgresService: PostgresService;

  constructor(postgresService: PostgresService) {
    this.client = mqtt.connect(config.mqttBrokerUrl);
    this.postgresService = postgresService;
    this.topic = `tele/${config.tasmotaDevice}/+`; // Subscribe to all telemetry topics for the Tasmota device
  }

  start() {
    this.client.on('connect', () => {
      console.log(`Connected to MQTT broker at ${config.mqttBrokerUrl}`);
			
      this.client.subscribe(this.topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to topic ${this.topic}`, err);
          process.exit(1);
        }
        console.log(`Subscribed to topic ${this.topic}`);
      });
    });

    this.client.on('message', (receivedTopic, message) => {
      let payload = message.toString();
      console.log(`Received message on topic ${receivedTopic}: ${payload}`);

      // If payload is not a valid JSON, then restructuring it to a valid JSON as {"message": payload}\
      try {
        JSON.parse(payload);
      } catch (error) {
        payload = JSON.stringify({ message: payload });
      }

      const document = {
        topic: receivedTopic,
        payload: payload,
        timestamp: new Date()
      };

      const collectionName = receivedTopic.replace(/\//g, '_'); // Replace '/' with '_' to form a valid collection name
      this.postgresService.insertMessage(collectionName, document);
    });

    this.client.on('error', (err) => {
      console.error("MQTT client error", err);
    });
  }
}
