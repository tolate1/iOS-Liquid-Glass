import Ajv from "ajv";
import configSchema from "../schemas/config.schema.json" with { type: "json" };
import inventorySchema from "../schemas/inventory.schema.json" with { type: "json" };
import planSchema from "../schemas/plan.schema.json" with { type: "json" };

const ajv = new Ajv({ allErrors: true, schemas: [inventorySchema] });
const validators = {
  config: ajv.compile(configSchema),
  inventory: ajv.getSchema(inventorySchema.$id),
  plan: ajv.compile(planSchema),
};

export function validate(kind, data) {
  const check = validators[kind];
  if (!check(data)) {
    const reasons = check.errors.map((error) => `${error.instancePath || "/"} ${error.message}`);
    throw new Error(`Invalid ${kind}: ${reasons.join(", ")}`);
  }
  return data;
}
