import { Document, Schema, model } from "mongoose";

export interface Files extends Document {
     fileId: string,
     originalname: string,
     mimetype:string,
}

const FilesSchema = new Schema<Files>({
     fileId: String,
     originalname: String,
     mimetype:String
})

export const FilesModel = model('FilesModel', FilesSchema);

export interface User extends Document {
     email: string,
     password?: string,
     lastLogin?: Date,
     firstName?: string,
     lastName?: string,
     events?: string[],
     todos?: string[],
     username: string
}

const UserSchema = new Schema<User>({
     email: { type: String, unique: true },
     password: { type: String, select: false },
     firstName: String,
     lastName: String,
     username:String,
     todos: [
          { type: Schema.Types.ObjectId, ref:'TodoModel'},
     ],
     events: [
          { type: Schema.Types.ObjectId, ref:'EventModel' }
     ]
}, {
     timestamps: true
});
export const UserModel = model<User>('UserModel', UserSchema);