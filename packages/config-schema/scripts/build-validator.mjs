import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Ajv2020 } from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";
import addFormats from "ajv-formats";

const ajv = new Ajv2020({
  strict: true,
  allErrors: true,
  code: { source: true, esm: true },
});
addFormats(ajv);

// CommonJS modules with `__esModule` and no `default` export, imported by name
const NAMED_IMPORTS = { "ajv-formats/dist/formats": ["fullFormats"] };

mkdirSync(new URL("../generated/", import.meta.url), { recursive: true });

for (const version of ["v1", "v2"]) {
  const schema = JSON.parse(
    readFileSync(
      new URL(`../schemas/config-${version}.schema.json`, import.meta.url),
      "utf8",
    ),
  );

  // ajv emits CommonJS `require()` for its runtime helpers even in esm mode: turn them into imports.
  const specifiers = [];
  const source = standaloneCode(ajv, ajv.compile(schema)).replace(
    /require\("([^"]+)"\)/g,
    (_, specifier) => {
      if (!specifiers.includes(specifier)) specifiers.push(specifier);
      return `__dep${specifiers.indexOf(specifier)}`;
    },
  );
  // Tools disagree on the shape of a default import of a CommonJS module (Node gives module.exports,
  // Vite/vitest may unwrap `default` when `__esModule` is set), so normalise it back to module.exports.
  // Modules listed in NAMED_IMPORTS have no `default` export: Vite unwraps their default to `undefined`,
  // so they are imported by name, which every tool resolves the same way.
  const imports =
    specifiers
      .map((specifier, i) => {
        const path = `${specifier}${specifier.endsWith(".js") ? "" : ".js"}`;
        const names = NAMED_IMPORTS[specifier];
        return names
          ? `import { ${names.join(", ")} } from "${path}";`
          : `import __raw${i} from "${path}";`;
      })
      .join("") +
    "const __cjs = (m) => (typeof m === 'function' ? { default: m } : m);" +
    specifiers
      .map((specifier, i) => {
        const names = NAMED_IMPORTS[specifier];
        return names
          ? `const __dep${i} = { ${names.join(", ")} };`
          : `const __dep${i} = __cjs(__raw${i});`;
      })
      .join("");

  writeFileSync(
    new URL(`../generated/validate-config-${version}.js`, import.meta.url),
    `${imports}${source}`,
  );
  writeFileSync(
    new URL(`../generated/validate-config-${version}.d.ts`, import.meta.url),
    `import type { ErrorObject } from "ajv";
declare function validate(data: unknown): boolean;
declare namespace validate {
  let errors: ErrorObject[] | null | undefined;
}
export { validate };
export default validate;
`,
  );
  // Each schema has its own $id; drop it so the next compile does not clash.
  ajv.removeSchema(schema.$id);
}
