import type { RequestHandler } from 'express';

const logger: RequestHandler = (req, _res, next) => {
    console.log(req.url);
    // console.log(req.body);
    next();
};

export default logger;