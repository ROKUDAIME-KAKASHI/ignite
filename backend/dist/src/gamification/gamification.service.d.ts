import { PrismaService } from '../prisma/prisma.service';
export declare class GamificationService {
    private prisma;
    constructor(prisma: PrismaService);
    getLeaderboard(): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        xp: number;
        level: number;
    }[]>;
}
