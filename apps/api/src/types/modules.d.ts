// Type declarations for missing modules

declare module 'swagger-jsdoc' {
  function swaggerJSDoc(options: any): any;
  export default swaggerJSDoc;
}

declare module 'swagger-ui-express' {
  export function setup(swaggerDocument: any, options?: any): any;
  export function serve(...args: any[]): any;
  const swaggerUi: {
    setup: typeof setup;
    serve: typeof serve;
  };
  export default swaggerUi;
}

declare module 'multer' {
  interface Multer {
    (options?: any): any;
    diskStorage(options: any): any;
  }
  const multer: Multer;
  export = multer;
}

declare module 'morgan' {
  function morgan(format: string, options?: any): any;
  export = morgan;
}

declare module 'cors' {
  export interface CorsOptions {
    origin?: boolean | string | RegExp | (string | RegExp)[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  }

  function cors(options?: CorsOptions): any;
  export default cors;
  export { CorsOptions };
}

declare module 'express' {
  export interface Request {
    [key: string]: any;
  }
  export interface Response {
    [key: string]: any;
  }
  export interface NextFunction {
    (err?: any): void;
  }
  export interface Application {
    [key: string]: any;
  }
  export interface Router {
    [key: string]: any;
  }
  
  export interface Express extends Application {}
  
  function express(): Application;
  namespace express {
    interface RequestHandler {
      (req: Request, res: Response, next: NextFunction): any;
    }
    function Router(options?: any): Router;
    function static(root: string, options?: any): RequestHandler;
    function json(options?: any): RequestHandler;
    function urlencoded(options?: any): RequestHandler;
  }
  export = express;
}

declare module 'jsonwebtoken' {
  export function sign(payload: any, secretOrPrivateKey: any, options?: any): string;
  export function verify(token: string, secretOrPublicKey: any, options?: any): any;
  export function decode(token: string, options?: any): any;
}

declare module 'zod' {
  export const z: any;
  export class ZodError extends Error {
    issues: any[];
  }
}

declare module 'helmet' {
  function helmet(options?: any): any;
  export default helmet;
}

declare module 'express-rate-limit' {
  function rateLimit(options?: any): any;
  export default rateLimit;
}

declare module '@prisma/client' {
  export class PrismaClient {
    constructor(options?: any);
    [key: string]: any;
  }
}

declare module 'bcryptjs' {
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function hashSync(data: string, saltOrRounds: string | number): string;
  export function compareSync(data: string, encrypted: string): boolean;
  export function genSaltSync(rounds?: number): string;
  export function genSalt(rounds?: number): Promise<string>;
  const bcryptjs: {
    hash: typeof hash;
    compare: typeof compare;
    hashSync: typeof hashSync;
    compareSync: typeof compareSync;
    genSaltSync: typeof genSaltSync;
    genSalt: typeof genSalt;
  };
  export default bcryptjs;
}