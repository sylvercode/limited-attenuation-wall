import { id } from "../module.json";

export const MODULE_ID = "sylvercode-enhance-limited-wall";
export const UPPER_MODULE_ID = MODULE_ID.toUpperCase();

if (MODULE_ID !== id) throw new Error(`Module ID mismatch: ${MODULE_ID} !== ${id}`);
