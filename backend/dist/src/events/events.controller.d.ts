import { EventsService } from './events.service';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
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
