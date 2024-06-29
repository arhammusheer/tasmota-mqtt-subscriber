import { MongoService } from './services/mongo.service';
import { MqttService } from './services/mqtt.service';

async function main() {
  const mongoService = new MongoService();
  await mongoService.connect();

  const mqttService = new MqttService(mongoService);
  mqttService.start();

  process.on('SIGINT', async () => {
    await mongoService.close();
    process.exit(0);
  });
}

main().catch(console.error);
