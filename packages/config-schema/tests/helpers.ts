import { readFileSync } from "node:fs";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

export const read = (path: string) => {
  return JSON.parse(
    readFileSync(new URL(`../${path}`, import.meta.url), "utf8"),
  );
};

const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);

export const compileSchema = (name: string) => {
  return ajv.compile(read(`schemas/${name}.schema.json`));
};
