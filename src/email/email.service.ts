import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Mail from 'nodemailer/lib/mailer';
import emailConfig from 'src/common/config/email.config';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: Mail;

  constructor(
    @Inject(emailConfig.KEY) private config: ConfigType<typeof emailConfig>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: config.service,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });
  }

  async sendMemberJoinVerification(
    emailAddress: string,
    signupVerifyToken: string,
  ) {
    const baseUrl = this.config.baseUrl;

    const url = `${baseUrl}/users/email-verify?signupVerifyToken=${signupVerifyToken}`;

    const mailOptions: EmailOptions = {
      to: emailAddress,
      subject: '회원가입 이메일 인증',
      html: `
        <form action="${url}" method="POST" style="background-color: #f8f9f9; padding: 2.5em">
          <h1><span style="color: #819ff7">이메일 인증</span><br />링크를 안내드립니다.</h1>
          <div style="margin-top: 3em">
            <p style="margin-bottom: 0">아래의 <b>인증하기</b> 버튼을 클릭하면</p>
            <p style="margin-top: 0.3em">이메일 인증이 완료 됩니다.</p>
          </div>
          <div style="display: flex; justify-content: center; margin-top: 3em">
            <button style="position: relative; width: 15%; background: #819ff7; border: none; border-radius: 1.5em; padding: 0.9em; color: white; font-size: 1.1em; text-align: center; text-decoration: none; cursor: pointer;">인증하기</button>
          </div>
        </form>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
