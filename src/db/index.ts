import 'dotenv/config';
import { drizzle, } from "drizzle-orm/mysql2";
import * as schema from "./schema";

export default drizzle(process.env.DATABASE_URL!, {
  schema,
  mode: "default",
  logger: true,
});
