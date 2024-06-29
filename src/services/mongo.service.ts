import { MongoClient, Db } from "mongodb";
import { config } from "../config";

export class MongoService {
  private client: MongoClient;
  private db?: Db;

  constructor() {
    this.client = new MongoClient(config.mongoUri);
  }

  async connect() {
    try {
      await this.client.connect();
      console.log("Connected to MongoDB");
      this.db = this.client.db(config.dbName);
    } catch (err) {
      console.error("Failed to connect to MongoDB", err);
      process.exit(1);
    }
  }

  async insertMessage(collectionName: string, document: any) {
    if (this.db) {
      try {
        const collection = this.db.collection(collectionName);
        const result = await collection.insertOne(document);
        console.log(
          `Document inserted into collection ${collectionName} in MongoDB`,
          result.insertedId
        );
      } catch (err) {
        console.error(
          `Failed to insert document into collection ${collectionName} in MongoDB`,
          err
        );
      }
    } else {
      console.error("No MongoDB database found");
    }
  }

  async close() {
    await this.client.close();
  }
}
