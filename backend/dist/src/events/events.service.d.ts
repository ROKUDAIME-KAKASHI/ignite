import { PrismaService } from '../prisma/prisma.service';
export declare class EventsService {
    private prisma;
    constructor(prisma: PrismaService);
    getUpcomingEvents(): Promise<{
        id: string;
        title: string;
        description: string | null;
        date: Date;
        location: string | null;
        churchId: string | null;
        createdAt: Date;
    }[]>;
}
