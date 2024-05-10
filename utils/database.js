import { config } from "dotenv";
import { MongoClient } from "mongodb";

config();
const cnString = process.env.MONGODB_CONNECTION_STRING;
const mongodb = new MongoClient(cnString);

let _db;

const mongoConnect = (cb) => {
    
}

