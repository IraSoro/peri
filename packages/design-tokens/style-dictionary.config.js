import StyleDictionary from 'style-dictionary';

function resolve(rawByName, name, seen = new Set()) {
  const token = rawByName[name];
  if (!token) throw new Error(`Unresolved token reference: {${name}}`);
  const match = typeof token.value === 'string' && token.value.match(/^\{(.+)\}$/);
  if (!match) return token.value;
  const ref = match[1];
  if (seen.has(ref)) throw new Error(`Circular reference: ${[...seen, ref].join(' -> ')}`);
  return resolve(rawByName, ref, new Set(seen).add(ref));
}

function flattenPenpotFile(raw) {
  const setNames = Object.keys(raw).filter((k) => !k.startsWith('$'));
  const rawByName = {};
  for (const setName of setNames) {
    for (const [name, token] of Object.entries(raw[setName])) {
      rawByName[name] = { value: token.$value, type: token.$type };
    }
  }

  // genuinely nested — this is what lets Style Dictionary build real paths
  const output = { primitives: {}, themes: {} };

  for (const [name, token] of Object.entries(raw.Global ?? {})) {
    output.primitives[name] = { value: resolve(rawByName, name), type: token.$type };
  }

  for (const theme of raw.$themes ?? []) {
    const themeKey = theme.name.toLowerCase();
    const semanticSets = Object.entries(theme.selectedTokenSets)
      .filter(([setName, state]) => state === 'enabled' && setName !== 'Global')
      .map(([setName]) => setName);

    if (semanticSets.length === 0) continue; // e.g. Dark has no semantic set yet

    output.themes[themeKey] = {};
    for (const setName of semanticSets) {
      for (const [name, token] of Object.entries(raw[setName] ?? {})) {
        output.themes[themeKey][name] = { value: resolve(rawByName, name), type: token.$type };
      }
    }
  }

  return output;
}

StyleDictionary.registerParser({
  name: 'token-json',
  pattern: /\.json$/,
  parser: ({ contents }) => flattenPenpotFile(JSON.parse(contents)),
});

StyleDictionary.registerFormat({
  name: 'css/tailwind-theme',
  format: ({ dictionary }) => {
    const primitiveLines = [];
    const byTheme = {};
    const semanticNames = new Set();

    for (const t of dictionary.allTokens) {
      const [group, ...rest] = t.path; // real path segments, untouched
      if (group === 'primitives') {
        primitiveLines.push(`  --color-${rest[0]}: ${t.value};`);
      } else if (group === 'themes') {
        const [themeKey, ...nameParts] = rest;
        const name = nameParts.join('-');
        semanticNames.add(name);
        byTheme[themeKey] ??= {};
        byTheme[themeKey][name] = t.value;
      }
    }

    const themeVarLines = [...semanticNames].map(
      (name) => `  --color-${name}: var(--semantic-${name});`
    );

    const themeBlocks = Object.entries(byTheme).map(([themeKey, tokens]) => {
      const lines = Object.entries(tokens).map(([name, value]) => `  --semantic-${name}: ${value};`);
      const selector = themeKey === 'light' ? ':root' : `[data-theme="${themeKey}"]`;
      return `${selector} {\n${lines.join('\n')}\n}`;
    });

    return ['@theme {', ...primitiveLines, ...themeVarLines, '}', '', ...themeBlocks, ''].join('\n');
  },
});

export default {
  source: ['tokens/tokens.json'],
  parsers: ['token-json'],
  platforms: {
    css: {
      // no transformGroup — we build the CSS text manually from raw token.path/value
      files: [{ destination: './dist/tokens.gen.css', format: 'css/tailwind-theme' }],
    },
  },
};
