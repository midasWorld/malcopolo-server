export class UserCreatedEvent {
  EVENT_NAME: 'user.created';
  email: string;
  signupVerifyToken: string;

  constructor(email: string, signupVerifyToken: string) {
    this.email = email;
    this.signupVerifyToken = signupVerifyToken;
  }
}
