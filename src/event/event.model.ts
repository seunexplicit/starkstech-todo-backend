import { Document, Schema, model } from "mongoose";

interface EventTime {
     dateTime: Date,
     timeZone:string,
}

interface EventAttendant {
     email: string,
     name:string
}

export interface Event extends Document {
     summary?: string,
     location?: string,
     description?: string,
     start?: EventTime,
     end?: EventTime,
     recurrence?: string[],
     attendees?: EventAttendant[],
     files?: [string],
     user?: string,
     htmlLink?:string
}

const EventSchema = new Schema<Event>({
     summary: String,
     location: String,
     description: String,
     start: {
          dateTime: Date,
          timeZone: String
     },
     end: {
          dateTime: Date,
          timeZone: String
     },
     recurrence: [{ type: String }],
     attendees: {
          email: String,
          name: String
     },
     htmlLink:String,
     files: [{ type: Schema.Types.ObjectId, ref: 'FilesModel' }],
     user: { type: Schema.Types.ObjectId, ref: 'UserModel'},

})

export const EventModel = model<Event>('EventModel', EventSchema)
