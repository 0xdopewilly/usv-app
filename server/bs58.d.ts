declare module 'bs58' {
  export function encode(input: Uint8Array | Buffer | number[]): string;
  export function decode(input: string): Uint8Array;
}
