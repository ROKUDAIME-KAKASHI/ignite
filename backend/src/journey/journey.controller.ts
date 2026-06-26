import { Controller, Get } from '@nestjs/common';
import { JourneyService } from './journey.service';

@Controller('journey')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Get('today')
  getTodayJourney() {
    return this.journeyService.getTodayJourney();
  }
}
