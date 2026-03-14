// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error({
    method:  req.method,
    url:     req.originalUrl,
    message: err.message,
    stack:   err.stack
  }, 'Unhandled error')

  const isKnown = ['Unauthorized', 'User already exists'].includes(err.message)

  res.status(isKnown ? 401 : 500).json({
    error: isKnown ? err.message : 'Internal server error'
  })
}