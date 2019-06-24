import express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import routes from './routes/rotas';

var app = express();

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/meifacil');

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Method', 'PUT, POST, DELETE, GET');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, DELETE, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
    next();
});

app.options('*', function (req, res, next) {
    if (req.method == 'OPTIONS')
        res.sendStatus(200);
});

app.use('/api', routes);

app.use(function (req, res, next) {
    let err: any;
    err = new Error('Not found');
    err.status = 404;
    next(err);
});

app.use(function (err: { status: any; message: any; }, req: any, res: { status: (arg0: any) => void; json: (arg0: { message: any; error: {}; }) => void; }, next: any) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

var port = 1337;
app.listen(port);