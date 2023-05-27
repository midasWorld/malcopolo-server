import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/email/email.service';
import { UserCreatedEvent } from './user-created.event';
import { EventType } from 'src/common/event.type';

@Injectable()
export class UserEventsListener {
  constructor(private readonly emailService: EmailService) {}

  @OnEvent(EventType.UserCreated)
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    const { email, signupVerifyToken } = event;
    this.emailService.sendMemberJoinVerification(email, signupVerifyToken);
  }
}
