
import Multer from 'multer';
import './environment';
import { config as config_dotenv } from 'dotenv';
import { resolve } from 'path';
import mongoose from "mongoose";

switch (process.env.NODE_ENV) {
     case 'production':
          config_dotenv({
               path: resolve(__dirname, '../.env.production')
          })
          break
     case 'development':
          config_dotenv({
               path: resolve(__dirname, '../.env')
          })
          break
     default:
          throw new Error(`'NODE_ENV' ${process.env.NODE_ENV} is not handled`);
}


const dbConnection = mongoose.connect(process.env.MONGOOSE_URL || '');

dbConnection.then(
     (success) => { console.log(`connected to database successfully`) },
     (error) => { console.log(`error connecting to the database`) })


export const multer: Multer.Multer = Multer({
     storage: Multer.memoryStorage(),
     limits: {
          fileSize: Number(process.env.CLIENT_FILE_SIZE)
     }
})

