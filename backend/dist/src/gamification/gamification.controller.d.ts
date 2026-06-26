import { GamificationService } from './gamification.service';
export declare class GamificationController {
    private readonly gamificationService;
    constructor(gamificationService: GamificationService);
    getLeaderboard(): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        xp: number;
        level: number;
    }[]>;
}
