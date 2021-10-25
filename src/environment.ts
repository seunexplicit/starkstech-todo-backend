declare global {
     namespace NodeJS {
          interface ProcessEnv {
               NODE_ENV: 'development' | 'production';
          }
     }

     namespace Express {
          interface Request {
               credentialEmail: string,
               credentialPassword: string,
               credentialId: string,
               authToken: any,
          }
     }
}

export {}