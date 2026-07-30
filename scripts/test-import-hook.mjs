import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

export function resolve(specifier, context, nextResolve) {
  if (specifier === '@/types') {
    return {
      url: pathToFileURL(join(projectRoot, 'types/index.ts')).href,
      shortCircuit: true,
    };
  }

  if (specifier === '@/config/product-validation-dictionaries') {
    return {
      url: pathToFileURL(join(projectRoot, 'config/product-validation-dictionaries.ts')).href,
      shortCircuit: true,
    };
  }

  if (specifier === '@/config/trust-score-dictionaries') {
    return {
      url: pathToFileURL(join(projectRoot, 'config/trust-score-dictionaries.ts')).href,
      shortCircuit: true,
    };
  }

  if (specifier.startsWith('@/')) {
    const relPath = specifier.slice(2);
    const target =
      relPath === 'types'
        ? join(projectRoot, 'types/index.ts')
        : join(projectRoot, relPath.endsWith('.ts') ? relPath : `${relPath}.ts`);
    return {
      url: pathToFileURL(target).href,
      shortCircuit: true,
    };
  }

  return nextResolve(specifier, context);
}
