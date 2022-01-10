import { randomBytes } from 'crypto';
export const sessionID = () => randomBytes(16).toString('base64');