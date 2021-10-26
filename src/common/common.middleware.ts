import { NextFunction, Request, Response } from "express";
import { createHash } from 'crypto';
import { DecryptToken } from "../module/login.module";
import { JsonWebTokenError } from "jsonwebtoken";
import { UserModel } from "../user/user.model";

export class CommonMiddleware {

     authRequired: string = '';

     authorizedUser(req: Request, res: Response, next: NextFunction) {
          try {
               const timestamp = req.headers['timestamp'] as any;
               const api_key = req.headers['api_key'];

               const hash = createHash('sha512').update(process.env.CLIENT_API_KEY + "||" + timestamp).digest('hex');
               let date_diff = Date.now() - Number(timestamp);
               date_diff = Math.abs(date_diff);
               if (api_key !== hash || date_diff > 60000) {
                    return res.status(401).send({ message: "Invalid Authorization", status: false });
               }
               next()
          }
          catch (err) {
               return res.status(401).send({ message: "Invalid Authorization", status: false });
          }
     }

     async authenticateUser(req: Request, res: Response, next: NextFunction){
          try {
               let auth = req.headers['authorization'];
               if (auth?.split(' ')[1]) auth = (auth?.split(' '))[1];
               else return res.status(403).send({message:'Invalid/expired authentication token', status: false });

               let userCredentials: any = DecryptToken(auth, process.env.CLIENT_API_KEY || '');
               if (new Date() > new Date(userCredentials['expiresTime'])) return res.status(403).send({ message: 'Invalid/expired authentication token', status: false });
               req.credentialEmail = userCredentials['email'];
               req.credentialId = userCredentials['id'];
               req.credentialPassword = userCredentials['password'];
               req.authToken = userCredentials['token'];
               if (
                    !req.authToken && !(req.credentialEmail && req.credentialPassword)
               ) return res.status(403).send({ message: 'Invalid/expired authentication token', status: false });
               if (this?.authRequired == 'oAuth' && !req.authToken) {
                    return res.status(401).send({ message: 'Google login is required for this action', status: false });
               }
               if (this?.authRequired == 'localAuth' && !(req.credentialEmail && req.credentialPassword)) {
                    return res.status(401).send({ message: 'Email & password login is required for this action', status: false });
               }
               if (req.credentialEmail && req.credentialPassword) {
                    const user = await UserModel.findOne({ email: req.credentialEmail }).select('password');
                    if (user?.password !== req.credentialPassword) return res.status(403).send({ message: 'Invalid/expired authentication token', status: false });
               }
              

               next();
          }
          catch (err) {
               if (err instanceof JsonWebTokenError) return res.status(403).send({ message: 'Invalid/expired authentication token', status: false });
               next(err);
          }
     }
}