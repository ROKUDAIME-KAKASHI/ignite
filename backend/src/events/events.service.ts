import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async getUpcomingEvents() {
    return this.prisma.event.findMany({
      where: {
        date: {
          gte: new Date(),
        }
      },
      orderBy: {
        date: 'asc',
      },
      take: 10,
    });
  }
}
