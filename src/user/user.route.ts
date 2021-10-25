import { Application, NextFunction, Request, Response } from "express";
import { CommonRoute } from "../common/common.route";
import { multer } from "../config";
import { UserService } from "./user.service";

export class UserRoute extends CommonRoute {

     private service: UserService = new UserService();

     constructor(
          public userApp: Application
     ) {
          super(userApp, 'UserRoute');
     }

     configureRoute(): Application {
          const service: UserService = new UserService();
          const oAuthRequiredAuth = this.middleware.authenticateUser.bind({ ...this.middleware, authRequired:'oAuth' })

          this.app.get('/google-auth-url', service.googleAuthUrl)
               .post('/login', service.login)
               .post('/create-new', service.createNewUser)
               .post('/google-access-token-code', service.googleAccessToken)
               .post('/file', oAuthRequiredAuth,
                    multer.any(), service.googleFileUpload)
               .get('/file/:fileId', oAuthRequiredAuth, service.googleFileRetrival);

          return this.app
     }
}