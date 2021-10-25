import { createHash } from 'crypto';
import { sign, verify } from 'jsonwebtoken';

export  const hashData = (data: string)=> {
     return createHash('sha512')
          .update(data)
          .digest('hex')
}

export const encryptData = (
     data:{ [key:string]:any },
     secondToExp: number,
     secretKey: string
) => {
     const expiresTime = new Date(new Date().getTime() + (secondToExp * 1000));
     const token = sign(
          { ...data, expiresTime },
          secretKey,
          { expiresIn: secondToExp, algorithm: 'HS256' });
     return { expiresTime, token };
}

export const DecryptToken = (
     token: string,
     secretKey: string,
) => {
     try {
          return verify(token, secretKey || '');
     }
     catch (err) {
          throw err;
     }
}