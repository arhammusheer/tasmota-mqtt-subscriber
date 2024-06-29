import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  tasmotaDevice: process.env.TASMOTA_DEVICE as string,
  mqttBrokerUrl: process.env.MQTT_BROKER_URL as string,
  mongoUri: process.env.MONGODB_URI as string,
  dbName: process.env.MONGODB_DB_NAME as string,
};

if (!config.tasmotaDevice || !config.mqttBrokerUrl || !config.mongoUri || !config.dbName) {
  console.error("Missing environment variables");
  process.exit(1);
}
