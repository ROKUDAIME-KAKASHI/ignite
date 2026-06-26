import { PrismaService } from '../prisma/prisma.service';
export declare class JourneyService {
    private prisma;
    constructor(prisma: PrismaService);
    getTodayJourney(): Promise<{
        mission: {
            id: string;
            title: string;
            description: string;
            xpReward: number;
            createdAt: Date;
        } | null;
        quiz: ({
            questions: ({
                answers: {
                    id: string;
                    text: string;
                    questionId: string;
                    isCorrect: boolean;
                }[];
            } & {
                id: string;
                quizId: string;
                type: string;
                text: string;
            })[];
        } & {
            id: string;
            title: string;
            description: string | null;
            xpReward: number;
            createdAt: Date;
            type: string;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        date: Date;
        verse: string;
        verseRef: string;
        reflection: string;
        prayer: string;
        missionId: string | null;
        quizId: string | null;
    }>;
}
