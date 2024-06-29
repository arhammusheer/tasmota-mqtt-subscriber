import { MqttService } from "./services/mqtt.service";
import { PostgresService } from "./services/postgres.service";
import { config } from "./config";

async function main() {
  const postgresService = new PostgresService();
  await postgresService.connect();

  // Internal Data
  const sensorData = new MqttService(postgresService);
  sensorData.start();

  // Additional Topics
  for (const topic of config.mqttTopics) {
    const mqttService = new MqttService(postgresService, topic);
    mqttService.start();
  }
  
  process.on("SIGINT", async () => {
    await postgresService.close();
    process.exit(0);
  });
}

main().catch(console.error);
