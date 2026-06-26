import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

// Normally, you would initialize this using a service account key JSON file
// or environment variables injected at runtime.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Assumes GOOGLE_APPLICATION_CREDENTIALS is set
    // You can also use admin.credential.cert(serviceAccountJson)
  });
}

@Injectable()
export class AuthService {
  async verifyToken(token: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase Token');
    }
  }
}
