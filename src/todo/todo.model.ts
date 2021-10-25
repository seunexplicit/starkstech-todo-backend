import { Document, Schema, model } from "mongoose";


interface Task {
     task: string,
     description: string,
     startTime: string,
     endTime: string,
     files: string[],
     status: 'undone' | 'done',
}


export interface Todo extends Document {
     date?: Date,
     name?: string,
     tasks:Task[],
     user?: string,
}

const TodoSchema = new Schema<Todo>({
     date: Date,
     name: String,
     tasks: [
          {
               task: String,
               description: String,
               startTime: String,
               endTime: String,
               files: [{ type: Schema.Types.ObjectId, ref: 'FilesModel' }],
               status: { type: String, enum: ['undone', 'done'], default: 'undone' }
          }
     ],
     user: { type: Schema.Types.ObjectId, ref: 'UserModel' },

},
     {
          timestamps:true,
     })

export const TodoModel = model<Todo>('TodoModel', TodoSchema)
