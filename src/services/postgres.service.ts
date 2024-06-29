import { Client } from 'pg';
import { config } from '../config';

export class PostgresService {
  private client: Client;

  constructor() {
    this.client = new Client({ connectionString: config.postgresUri });
  }

  async connect() {
    try {
      await this.client.connect();
      console.log("Connected to PostgreSQL");
    } catch (err) {
      console.error("Failed to connect to PostgreSQL", err);
      process.exit(1);
    }
  }

  async createTableIfNotExists(tableName: string) {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        topic TEXT NOT NULL,
        payload JSON NOT NULL,
        timestamp TIMESTAMP NOT NULL
      );
    `;

    try {
      await this.client.query(createTableQuery);
      console.log(`Table ${tableName} ensured to exist in PostgreSQL`);
    } catch (err) {
      console.error(`Failed to create table ${tableName} in PostgreSQL`, err);
    }
  }

  async insertMessage(tableName: string, document: any) {
    await this.createTableIfNotExists(tableName);

    const query = {
      text: `INSERT INTO ${tableName} (topic, payload, timestamp) VALUES ($1, $2, $3)`,
      values: [document.topic, document.payload, document.timestamp],
    };

    try {
      await this.client.query(query);
      console.log(`Document inserted into table ${tableName} in PostgreSQL`);
    } catch (err) {
      console.error(`Failed to insert document into table ${tableName} in PostgreSQL`, err);
    }
  }

  async close() {
    await this.client.end();
  }
}
