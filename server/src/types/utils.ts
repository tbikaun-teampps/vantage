import { Database } from "./database";

export type TableNames = keyof Database["public"]["Tables"];
