import type { RequestHandler } from 'express';

const logger: RequestHandler = (req, _res, next) => {
    console.log(req.method, req.url);
    next();
};

export default logger;