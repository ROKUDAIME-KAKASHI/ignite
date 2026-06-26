import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JourneyService {
  constructor(private prisma: PrismaService) {}

  async getTodayJourney() {
    // In a real app, this would query by today's date.
    // For now, we fetch the most recent one or return a default.
    const journey = await this.prisma.dailyJourney.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        mission: true,
        quiz: {
          include: { questions: { include: { answers: true } } }
        }
      }
    });

    if (!journey) {
      throw new NotFoundException("Today's journey not found");
    }

    return journey;
  }
}
