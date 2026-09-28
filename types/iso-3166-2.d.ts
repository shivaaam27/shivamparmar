declare module 'iso-3166-2' {
  const iso: { subdivision(code: string): { name: string; countryCode: string; code: string } | undefined | Record<string, never> };
  export default iso;
}
