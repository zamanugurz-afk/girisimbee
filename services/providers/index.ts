import 'server-only';

import { LetgoProviderService } from './letgo';
import { DolapProviderService } from './dolap';

export const letgoProvider = new LetgoProviderService();
export const dolapProvider = new DolapProviderService();

/** Active production providers — Sahibinden disabled until anti-bot infra is ready. */
export const ALL_PROVIDERS = [letgoProvider, dolapProvider];
