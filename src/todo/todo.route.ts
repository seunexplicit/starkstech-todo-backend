import { Application, NextFunction, Request, Response } from "express";
import { CommonRoute } from "../common/common.route";
import { TodoService } from "./todo.service";

export class TodoRoute extends CommonRoute {
     constructor(
          public app: Application
     ) {
          super(app, "Todo Route");
     }

     configureRoute(): Application {
          try {
               const service: TodoService = new TodoService();
               this.app
                    .get('/',
                         this.middleware.authenticateUser,
                         service.getAllTodo
                    )
                    .get('/:todoId',
                         this.middleware.authenticateUser,
                         service.getOneTodo
                    )
                    .post('/',
                         this.middleware.authenticateUser,
                         service.saveTodo
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