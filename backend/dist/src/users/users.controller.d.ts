import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(id: string): Promise<{
        church: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            location: string | null;
        } | null;
        badges: ({
            badge: {
                id: string;
                description: string;
                name: string;
                imageUrl: string | null;
            };
        } & {
            userId: string;
            badgeId: string;
            awardedAt: Date;
        })[];
    } & {
        id: string;
        createdAt: Date;
        firebaseUid: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        role: string;
        churchId: string | null;
        xp: number;
        level: number;
        streak: number;
        lastActiveAt: Date | null;
        updatedAt: Date;
    }>;
    createUser(data: Prisma.UserCreateInput): Promise<{
        id: string;
        createdAt: Date;
        firebaseUid: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        role: string;
        churchId: string | null;
        xp: number;
        level: number;
        streak: number;
        lastActiveAt: Date | null;
        updatedAt: Date;
    }>;
}
