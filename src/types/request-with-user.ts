// src/types/request-with-user.ts
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email?: string;
    name?: string;
    profilePicture?: string;
    maritalStatus?: string;
    dateOfBirth?: Date;
    age?: number;
    // other user properties as needed
  };
}
