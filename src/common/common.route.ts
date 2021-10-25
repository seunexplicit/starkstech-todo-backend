import { Application } from "express";
import { CommonMiddleware } from "./common.middleware";

export abstract class CommonRoute {

     middleware: CommonMiddleware = new CommonMiddleware();
     app: Application;
     constructor(
          app: Application,
          private name:string,
     ) {
          this.app = app;
          this.app.use(this.middleware.authorizedUser);
          this.configureRoute();
     }

     get routeName() {
          return this.name;
     }

     abstract configureRoute(): Application;
}