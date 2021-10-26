import { NextFunction, Request, Response } from "express";
import { TodoModel } from "./todo.model";
import { UserModel } from "../user/user.model";

export class TodoService {

     async saveTodo(req: Request, res: Response, next: NextFunction) {
          try {
               const { body, credentialId } = req;

               let todo = new TodoModel({
                    ...body,
                    user: credentialId
               });

		todo.save();
	       const user = await UserModel.findOne({_id:credentialId});
               user?.todos?.push(todo._id);
		user?.save();
               res.status(200).send({ message: 'success', status: true, data:todo })
          }
          catch (err) {
               next(err);
          }
     }

     async getOneTodo(req: Request, res: Response, next: NextFunction) {
          try {
               const { params } = req;
               const todo = await TodoModel.findOne({ _id: params.todoId })
                    .populate('tasks.files');

               res.status(200).send({ message: 'success', status: true, data: todo });

          }
          catch (err) {
               next(err);
          }
     }

     async updateStatus(req: Request, res: Response, next: NextFunction) {
          try{
               const { body } = req;
               const todo = await TodoModel.findOne({_id:body.todoId});
               todo!.tasks[body.taskIndex].status = body.status;
               todo?.save();
               res.status(200).send({message:'success', status:true, data:todo}); 
          }
          catch(err){
               next(err);
          }
     }

     async getAllTodo(req: Request, res: Response, next: NextFunction) {
          try {
               const { query, credentialId } = req;
               const page = query.page ? Number(query.page) : 1;
               const limit = query.limit ? Number(query.limit) : 20;
               const [todos, documentSize] = await Promise.all([
                    TodoModel.find({ user: credentialId })
                         .skip((page - 1) * limit)
                         .limit(limit),
                    TodoModel.countDocuments({ user: credentialId })
               ]);
               res.status(200).send({
                    message: 'success', status: true, data:
                    {
                         todos: todos,
                         document: {
                              page: page,
                              limit: limit,
                              pageSize: Math.ceil(documentSize / limit)
                         }
                    }
               })
          }
          catch (err) {
               next(err);
          }

     }
}