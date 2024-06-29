import * as mqtt from "mqtt";
import { config } from "../config";
import { PostgresService } from "./postgres.service";

export class MqttService {
  private client: mqtt.MqttClient;
  private topics: Set<string>;
  private postgresService: PostgresService;

  constructor(
    postgresService: PostgresService,
    topics: string[] = [`tele/${config.tasmotaDevice}/+`] // Default topics
  ) {
    this.client = mqtt.connect(config.mqttBrokerUrl);
    this.postgresService = postgresService;
    this.topics = new Set(topics);

    this.setupClient();
  }

  private setupClient() {
    this.client.on("connect", () => {
      console.log(`Connected to MQTT broker at ${config.mqttBrokerUrl}`);
      this.subscribeTopics();
    });

    this.client.on("message", (receivedTopic, message) => {
      let payload = message.toString();
      console.log(`Received message on topic ${receivedTopic}: ${payload}`);

      // If payload is not a valid JSON, then restructuring it to a valid JSON as {"message": payload}
      try {
        JSON.parse(payload);
      } catch (error) {
        payload = JSON.stringify({ message: payload });
      }

      const document = {
        topic: receivedTopic,
        payload: payload,
        timestamp: new Date(),
      };

      const collectionName = receivedTopic.replace(/\//g, "_"); // Replace '/' with '_' to form a valid collection name
      this.postgresService.insertMessage(collectionName, document);
    });

    this.client.on("error", (err) => {
      console.error("MQTT client error", err);
    });
  }

  private subscribeTopics() {
    this.topics.forEach(topic => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to topic ${topic}`, err);
        } else {
          console.log(`Subscribed to topic ${topic}`);
        }
      });
    });
  }

  addTopic(topic: string) {
    if (!this.topics.has(topic)) {
      this.topics.add(topic);
      this.client.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to topic ${topic}`, err);
        } else {
          console.log(`Subscribed to topic ${topic}`);
        }
      });
    }
  }
}
