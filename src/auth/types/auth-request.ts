// types/auth-request.ts
import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    roles: string[]; // e.g., ['user', 'admin']
    
    // Add more if needed
  };
}
