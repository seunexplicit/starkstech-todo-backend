import { Application, NextFunction, Request, Response } from "express";
import { CommonRoute } from "../common/common.route";
import { EventService } from "./event.service";

export class EventRoute extends CommonRoute {
     constructor(
          public app: Application
     ) {
          super(app, "Event Route");
     }

     configureRoute(): Application {
          try {
               const service: EventService = new EventService();
               this.app
                    .get('/',
                         this.middleware.authenticateUser,
                         service.getAllEvent
                    )
                    .get('/:eventId',
                         this.middleware.authenticateUser,
                         service.getOneEvent
                    )
                    .post('/',
                         this.middleware.authenticateUser,
                         service.saveEvent
                    );

               return this.app;
          }
          catch (err) {
               this.app.use((req: Request, res: Response, next: NextFunction) => {
                    next(err);
               })

               return this.app;
          }
     }
}