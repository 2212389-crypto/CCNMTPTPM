/// <reference types="node" />

// Node.js built-in modules
declare module 'path' {
  function join(...paths: string[]): string;
  function resolve(...pathSegments: string[]): string;
  function dirname(path: string): string;
  function basename(path: string, ext?: string): string;
  function extname(path: string): string;
  const sep: string;
  
  const path: {
    join: typeof join;
    resolve: typeof resolve;
    dirname: typeof dirname;
    basename: typeof basename;
    extname: typeof extname;
    sep: typeof sep;
  };
  export default path;
}

declare module 'fs' {
  function existsSync(path: string): boolean;
  function mkdirSync(path: string, options?: any): void;
  function readFileSync(path: string, encoding?: string): string | Buffer;
  function writeFileSync(path: string, data: any, encoding?: string): void;
  
  const fs: {
    existsSync: typeof existsSync;
    mkdirSync: typeof mkdirSync;
    readFileSync: typeof readFileSync;
    writeFileSync: typeof writeFileSync;
  };
  export default fs;
}

declare module 'os' {
  export function platform(): string;
  export function arch(): string;
  export function tmpdir(): string;
}

declare module 'crypto' {
  export function randomBytes(size: number): Buffer;
  export function createHash(algorithm: string): any;
}

// Global Node.js variables
declare global {
  const console: Console;
  const process: NodeJS.Process;
  const __dirname: string;
  const __filename: string;
  const require: NodeRequire;
  const setInterval: typeof global.setInterval;
  const clearInterval: typeof global.clearInterval;
  const setTimeout: typeof global.setTimeout;
  const clearTimeout: typeof global.clearTimeout;
  
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      NODE_ENV?: 'development' | 'production' | 'test';
      PORT?: string;
      DATABASE_URL?: string;
      JWT_ACCESS_SECRET?: string;
      JWT_REFRESH_SECRET?: string;
      CORS_ORIGIN?: string;
    }
    
    interface Process {
      env: ProcessEnv;
      exit(code?: number): never;
      cwd(): string;
      platform: string;
      arch: string;
      uptime(): number;
      on(event: string, listener: (...args: any[]) => void): this;
    }
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DATABASE_URL: string;
      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;
      CORS_ORIGIN: string;
      UPLOAD_DIR: string;
      LOG_LEVEL?: string;
    }
  }
}

export {};