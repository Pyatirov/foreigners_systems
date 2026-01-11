import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '@/services/token.service'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'No token' })

  const token = authHeader.split(' ')[1]
  try {
    const payload = verifyAccessToken(token)
    req.user = payload // добавляем user в объект запроса
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
