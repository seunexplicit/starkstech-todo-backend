import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import { getAuthToken } from "../module/service.module";
import { EventModel } from "../todo/todo.model";

export class EventService {

     async saveEvent(req: Request, res: Response, next: NextFunction) {
          try {
               const { body, authToken, credentialId } = req;
               let googleCalendar;
               if (authToken) {
                    const userToken = await getAuthToken({ token: authToken });
                    googleCalendar = google.calendar({ version: "v3", auth: userToken?.oAuth });
               }

               const calResponse = await googleCalendar?.events.insert(body);
               console.log(calResponse?.data, "calendar Response");
               let event = new EventModel({
                    ...body,
                    htmlLink: calResponse?.data.htmlLink,
                    user:credentialId
               });
               event.save();

               res.status(200).send({message:'success', status:true,})
          }
          catch (err) {
               next(err);
          }
     }

     async getOneEvent(req: Request, res: Response, next: NextFunction) {
          try {
               const { params } = req;
               const event = await EventModel.findOne({ _id: params.eventId })
                    .populate('files');

               res.status(200).send({ message: 'success', status: true, data: event });
               
          }
          catch (err) {
               next(err);
          }
     }

     async getAllEvent(req: Request, res: Response, next: NextFunction) {
          try {
               const { query, credentialId } = req;
               const page = query.page ? Number(query.page) : 1;
               const limit = query.limit ? Number(query.limit) : 20;
               const [events, documentSize] = await Promise.all([
                    EventModel.find({ user: credentialId })
                         .skip((page - 1) * limit)
                         .limit(limit),
                    EventModel.countDocuments({ user: credentialId })
               ]);
               res.status(200).send({
                    message: 'success', status: true, data:
                    {
                         events: events,
                         document: {
                              page: page,
                              limit: limit,
                              pageSize: Math.ceil(documentSize/limit)
                         }
                    }
               })
          }
          catch (err) {
               next(err);
          }

     }
}