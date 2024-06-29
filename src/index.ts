import { MqttService } from './services/mqtt.service';
import { PostgresService } from './services/postgres.service';

async function main() {
	const postgresService = new PostgresService();
	await postgresService.connect();

  const mqttService = new MqttService(postgresService);
  mqttService.start();

  process.on('SIGINT', async () => {
    await postgresService.close();
    process.exit(0);
  });
}

main().catch(console.error);
