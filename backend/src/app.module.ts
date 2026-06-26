import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GamificationModule } from './gamification/gamification.module';
import { JourneyModule } from './journey/journey.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, GamificationModule, JourneyModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
