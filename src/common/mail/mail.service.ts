import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail-queue') private mailQueue: Queue) {}

  /**
   * Adds an OTP email job to the queue
   * This ensures the API response isn't blocked by slow SMTP servers
   */
  async sendOtp(email: string, otp: string, subject: string) {
    await this.mailQueue.add('send-otp', { email, otp, subject }, {
      attempts: 3, // Retry up to 3 times if email fails
      backoff: {
        type: 'exponential',
        delay: 2000, // 2s, 4s, 8s
      },
      removeOnComplete: true, // Keep Redis clean
      removeOnFail: false, // Keep failed jobs for inspection
    });
  }
}