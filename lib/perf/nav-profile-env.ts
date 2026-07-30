export function isNavProfilingEnabled(): boolean {
  return process.env.NAV_PROFILE === '1';
}
