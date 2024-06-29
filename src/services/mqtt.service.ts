import * as mqtt from 'mqtt';
import { config } from '../config';
import { MongoService } from './mongo.service';

export class MqttService {
  private client: mqtt.MqttClient;
  private mongoService: MongoService;
  private topic: string;

  constructor(mongoService: MongoService) {
    this.client = mqtt.connect(config.mqttBrokerUrl);
    this.mongoService = mongoService;
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
      const payload = message.toString();
      console.log(`Received message on topic ${receivedTopic}: ${payload}`);

      const document = {
        topic: receivedTopic,
        payload: payload,
        timestamp: new Date()
      };

      const collectionName = receivedTopic.replace(/\//g, '_'); // Replace '/' with '_' to form a valid collection name
      this.mongoService.insertMessage(collectionName, document);
    });

    this.client.on('error', (err) => {
      console.error("MQTT client error", err);
    });
  }
}
