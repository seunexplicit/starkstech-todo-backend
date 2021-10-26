import { NextFunction, Request, Response } from "express";
import { google } from 'googleapis';
import { FilesModel, UserModel } from "./user.model";
import { encryptData, hashData } from "../module/login.module";
import stream from 'stream';
import { getAuthToken, getAuthUrl } from "../module/service.module";

export class UserService {

     async googleAuthUrl(req: Request, res: Response, next: NextFunction) {
          try {

               res.status(200).send({ status: true, message: "success", data: getAuthUrl() })
          }
          catch (err) {
               next(err)
          }
     }

     async googleAccessToken(req: Request, res: Response, next: NextFunction) {
          try {
               const { body } = req;
               const userToken = await getAuthToken({ code: body.code });

               const peopleService = google.people({ version: 'v1', auth: userToken?.oAuth });
               const peopleResponse = await peopleService.people.get({
                    resourceName: 'people/me',
                    personFields:'names,emailAddresses'
               });

               const userProfile = (peopleResponse.data.names?.find(each => each?.metadata?.primary));
               const userEmail = (peopleResponse.data.emailAddresses?.find(each => each?.metadata?.primary))?.value
               let user = await UserModel.findOne({
                    email: userEmail
               })

               if (user) {
                    if (!user.lastName) user.lastName = userProfile?.familyName;
                    if (!user.firstName) user.firstName = userProfile?.givenName
                    user.save();
               }
               else {
                    user = new UserModel({
                         email: userEmail,
                         lastName: userProfile?.familyName,
                         firstName: userProfile?.givenName
                    });
                    await user.save();
               }

               const credentials = encryptData(
                    {
                         email: userEmail,
                         token: userToken?.token,
                         id:user._id
                    },
                    Number(process.env.CLIENT_TOKEN_EXPIRE),
                    process.env.CLIENT_API_KEY || ''
               )

               res.status(200).send({
                    message: 'success', status: true, data: {
                         user: user, credentials: { ...credentials, type:'oAuth' } }
               });
          }
          catch (err:any) {
               if (Number(err.code) === 403 || Number(err.code) === 401) {
                    return res.status(err.code).send({status:false, message:"Invalid/Expired Authentication"})
               }
               next(err);
          }

     }

     async login(req: Request, res: Response, next: NextFunction) {
          try {
               const { body } = req;
               const user = await UserModel.findOne({
                    $or: [
                         { username: body.username },
                         { email: body.username },
                    ]
               }).select('password');

               if (!user) return res.status(401).send({ status: false, message: "Invalid/Expired Authentication" });
               const hashPassword = hashData(body.password);
               if (hashPassword !== user.password) return res.status(401).send({ status: false, message: "Invalid/Expired Authentication" });
               const credentials = encryptData(
                    {
                          password: hashPassword ,
                         email: user.email ,
                     id: user._id 
                    },
                    Number(process.env.CLIENT_TOKEN_EXPIRE),
                    process.env.CLIENT_API_KEY || ''
               );
               user.password = undefined;
               res.status(200).send({
                    message: 'Login success', status: true, data:
                         { user:user, credentials: { ...credentials, type: 'localAuth' } }
               })

          }
          catch (err) {
               res.status(401).send({ status: false, message: "Invalid/Expired Authentication" });
          }
     }


     async createNewUser(req: Request, res: Response, next: NextFunction) {
          try {
               const { body } = req;
               let user = await UserModel.findOne({
                    $or: [
                         { username: body.username },
                         { email: body.email },
                    ]
               });

               if (user && user.password) return res.status(400).send({ status: false, message: "User already exist" });
               else if (user && !user.password) {
                    user.username = body.username;
                    user.password = hashData(body.password);
               }
               else {
                    user = new UserModel({
                         ...body,
                         password: hashData(body.password)
                    });
               }
               await user.save();
               const credentials = encryptData(
                    {
                         password:user.password || '',
                         email:user.email,
                         id:user._id
                    },
                    Number(process.env.CLIENT_TOKEN_EXPIRE),
                    process.env.CLIENT_API_KEY || ''
               );
               user.password = undefined;
               res.status(200).send({ status: true, message: "Account created successfully", data: { user: user, credentials: {...credentials, type:'localAuth' } } });

          }
          catch (err) {
               next(err);
          }

     }

     async googleFileUpload(req: Request, res: Response, next: NextFunction) {
          try {
               const { files, authToken } = req;
               const userToken = await getAuthToken({ token: authToken })
               const driveService = google.drive({ version: 'v3', auth: userToken?.oAuth });
               const driveResponse = [];

               

               console.log(files);
               for (let j = 0; j < files!.length; j++) {
                    const readStream = new stream.Readable();
                    readStream.push(new Uint8Array((files as Express.Multer.File[])[j].buffer))
                    readStream.push(null);
                    const fileResponse = await driveService.files.create({
                         requestBody: {
                              name: (files as Express.Multer.File[])[j].originalname,
                              originalFilename: (files as Express.Multer.File[])[j].originalname
                         },
                         media: {
                              mimeType: (files as Express.Multer.File[])[j].mimetype || '',
                              body: readStream
                         },
                         fields: 'id',
                        
                    })
                    driveResponse.push(fileResponse);
               };
               if (driveResponse[0]) {
                    const FilesDoc = await FilesModel.insertMany(driveResponse.map((value, index) => {
                         console.log(value, index)
                         return {
                              fileId: value.data?.id,
                              originalname: (files as Express.Multer.File[])[index].originalname,
                              mimetype: (files as Express.Multer.File[])[index].mimetype
                         };
                    }));
                    return res.status(200).send({ message: 'success', status: true, data: FilesDoc });
               }

               res.status(400).send({ message: "invalid file data", status: false });
          }
          catch (err: any) {
               if (Number(err.code) === 403 || Number(err.code) === 401) {
                    return res.status(err.code).send({ status: false, message: "Invalid/Expired Authentication" })
               }
               next(err);
          }
     }

     async googleFileRetrival(req: Request, res: Response, next: NextFunction) {
          try {
               const { authToken, params } = req;
               const userToken = await getAuthToken({ token: authToken });
               const driveService = google.drive({ version: 'v3', auth: userToken?.oAuth });
               const [gResponse, lResponse] = await Promise.all([
                         driveService.files.get({
                              fileId: params.fileId,
                              alt: 'media'
                         }),
                    FilesModel.findOne({ fileId: params.fileId})

                    ]);
               res.status(200).send({
                    message: "success", status: true, data: {
                         file: gResponse.data,
                         fileData:lResponse

                    }
               });
               
          }
          catch (err:any) {
               if (Number(err.code) === 403 || Number(err.code) === 401) {
                    return res.status(err.code).send({ status: false, message: "Invalid/Expired Authentication" })
               }
               next(err)
          }
     }
}