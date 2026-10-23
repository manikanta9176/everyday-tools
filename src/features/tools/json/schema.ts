import Ajv from "ajv";
import { parseJson } from "./json-tools";

export function validateJsonSchema(dataText: string, schemaText: string) {
  const data = parseJson(dataText);
  const schema = parseJson(schemaText);
  const ajv = new Ajv({ allErrors: true, strict: false });
  let validate: ReturnType<Ajv["compile"]>;
  try {
    validate = ajv.compile(schema as object);
  } catch (error) {
    throw new Error(error instanceof Error ? `Schema: ${error.message}` : "The schema could not be compiled.");
  }
  const valid = validate(data);
  return {
    valid: Boolean(valid),
    errors: (validate.errors ?? []).map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`),
  };
}
