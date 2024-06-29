import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  tasmotaDevice: process.env.TASMOTA_DEVICE as string,
  mqttBrokerUrl: process.env.MQTT_BROKER_URL as string,
  mongoUri: process.env.MONGODB_URI as string,
  dbName: process.env.MONGODB_DB_NAME as string,
  postgresUri: process.env.POSTGRES_URI as string,
};

if (
  !config.tasmotaDevice ||
  !config.mqttBrokerUrl ||
  !config.dbName ||
  !config.postgresUri
) {
  console.error("Missing environment variables");
  process.exit(1);
}
