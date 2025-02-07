import { MqttService } from "./services/mqtt.service";
import { PostgresService } from "./services/postgres.service";
import { config } from "./config";

async function main() {
  // Declare when running production
  if (config.isProduction) {
    console.log("RUNNING IN PRODUCTION MODE - WILL INSERT INTO POSTGRES");
  }

  const postgresService = new PostgresService();
  await postgresService.connect();

  const mqttService = new MqttService(postgresService);

  // Subscribe to additional topics
  for (const topic of config.mqttTopics) {
    mqttService.addTopic(topic);
  }

  process.on("SIGINT", async () => {
    await postgresService.close();
    process.exit(0);
  });
}

main().catch(console.error);
