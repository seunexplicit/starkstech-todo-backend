import express from 'express';
import * as http from 'http';
import cors from 'cors';
import { CommonRoute } from './common/common.route';
import { UserRoute } from './user/user.route';
import cookieParser from 'cookie-parser';
import { EventRoute } from './event/event.route';
import { TodoRoute } from './todo/todo.route';

const app: express.Application = express();



const server: http.Server = http.createServer(app);

app.use(cors())
app.use(express.json());
app.use(cookieParser());

const v1App: express.Application = express();
const userApp: express.Application = express();
const eventApp: express.Application = express();
const todoApp: express.Application = express();

app.use('/api/v1', v1App);
v1App.use('/user', userApp);
v1App.use('/event', eventApp);
v1App.use('/todo', todoApp)

app.get('/auth/authorize', async (req, res, next) => {
     res.status(200).send({ status: true, message: "gotten succesfully", data: req.query?.code })
})

const routes: CommonRoute[] = [];
routes.push(new UserRoute(userApp));
routes.push(new EventRoute(eventApp));
routes.push(new TodoRoute(todoApp));

server.listen(process.env.PORT || 3004, () => {
     routes.forEach(values => {
          console.log(values.routeName, " => Activated");
     })
});
