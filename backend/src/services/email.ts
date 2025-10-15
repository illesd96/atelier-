import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import config from '../config';
import { Order, OrderItem } from '../types';

class EmailService {
  private transporter;
  private templates: Record<string, HandlebarsTemplateDelegate> = {};

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });

    this.loadTemplates();
  }

  private loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/emails');
    
    try {
      // Load confirmation template
      const confirmationHtml = fs.readFileSync(
        path.join(templatesDir, 'confirmation.html'), 
        'utf8'
      );
      this.templates['confirmation'] = Handlebars.compile(confirmationHtml);

      // Load cancellation template
      const cancellationHtml = fs.readFileSync(
        path.join(templatesDir, 'cancellation.html'), 
        'utf8'
      );
      this.templates['cancellation'] = Handlebars.compile(cancellationHtml);

      // Load payment failed template
      const paymentFailedHtml = fs.readFileSync(
        path.join(templatesDir, 'payment-failed.html'), 
        'utf8'
      );
      this.templates['payment-failed'] = Handlebars.compile(paymentFailedHtml);

    } catch (error) {
      console.error('Error loading email templates:', error);
    }
  }

  async sendBookingConfirmation(
    order: Order,
    items: OrderItem[],
    calendarFile?: Buffer
  ): Promise<void> {
    try {
      const template = this.templates['confirmation'];
      if (!template) {
        throw new Error('Confirmation email template not found');
      }

      const isHungarian = order.language === 'hu';
      
      const html = template({
        customerName: order.customer_name,
        orderId: order.id,
        bookingCode: order.id.slice(-8).toUpperCase(),
        items: items.map(item => ({
          ...item,
          room_name: this.getRoomName(item.room_id, isHungarian),
          formatted_date: this.formatDate(item.booking_date, isHungarian),
          formatted_time: `${item.start_time} - ${item.end_time}`,
        })),
        total: order.total_amount.toLocaleString(),
        currency: isHungarian ? 'Ft' : 'HUF',
        cancelUrl: `${config.frontendUrl}/booking/cancel?code=${order.id}`,
        rescheduleUrl: `${config.frontendUrl}/booking/reschedule?code=${order.id}`,
        language: order.language,
        isHungarian,
      });

      const attachments = [];
      if (calendarFile) {
        attachments.push({
          filename: 'booking.ics',
          content: calendarFile,
          contentType: 'text/calendar',
        });
      }

      await this.transporter.sendMail({
        from: `${config.email.fromName} <${config.email.from}>`,
        to: order.email,
        subject: isHungarian 
          ? `Foglalás megerősítve - ${order.id.slice(-8).toUpperCase()}`
          : `Booking Confirmed - ${order.id.slice(-8).toUpperCase()}`,
        html,
        attachments,
      });

      console.log(`Confirmation email sent to ${order.email}`);

    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }
  }

  async sendCancellationConfirmation(
    order: Order,
    items: OrderItem[]
  ): Promise<void> {
    try {
      const template = this.templates['cancellation'];
      if (!template) {
        throw new Error('Cancellation email template not found');
      }

      const isHungarian = order.language === 'hu';
      
      const html = template({
        customerName: order.customer_name,
        orderId: order.id,
        bookingCode: order.id.slice(-8).toUpperCase(),
        items: items.map(item => ({
          ...item,
          room_name: this.getRoomName(item.room_id, isHungarian),
          formatted_date: this.formatDate(item.booking_date, isHungarian),
          formatted_time: `${item.start_time} - ${item.end_time}`,
        })),
        total: order.total_amount.toLocaleString(),
        currency: isHungarian ? 'Ft' : 'HUF',
        language: order.language,
        isHungarian,
      });

      await this.transporter.sendMail({
        from: `${config.email.fromName} <${config.email.from}>`,
        to: order.email,
        subject: isHungarian 
          ? `Foglalás lemondva - ${order.id.slice(-8).toUpperCase()}`
          : `Booking Cancelled - ${order.id.slice(-8).toUpperCase()}`,
        html,
      });

      console.log(`Cancellation email sent to ${order.email}`);

    } catch (error) {
      console.error('Error sending cancellation email:', error);
      throw error;
    }
  }

  async sendPaymentFailedNotification(
    order: Order,
    items: OrderItem[]
  ): Promise<void> {
    try {
      const template = this.templates['payment-failed'];
      if (!template) {
        throw new Error('Payment failed email template not found');
      }

      const isHungarian = order.language === 'hu';
      
      const html = template({
        customerName: order.customer_name,
        orderId: order.id,
        bookingCode: order.id.slice(-8).toUpperCase(),
        items: items.map(item => ({
          ...item,
          room_name: this.getRoomName(item.room_id, isHungarian),
          formatted_date: this.formatDate(item.booking_date, isHungarian),
          formatted_time: `${item.start_time} - ${item.end_time}`,
        })),
        total: order.total_amount.toLocaleString(),
        currency: isHungarian ? 'Ft' : 'HUF',
        retryUrl: `${config.frontendUrl}/checkout?orderId=${order.id}`,
        language: order.language,
        isHungarian,
      });

      await this.transporter.sendMail({
        from: `${config.email.fromName} <${config.email.from}>`,
        to: order.email,
        subject: isHungarian 
          ? `Fizetési probléma - ${order.id.slice(-8).toUpperCase()}`
          : `Payment Issue - ${order.id.slice(-8).toUpperCase()}`,
        html,
      });

      console.log(`Payment failed email sent to ${order.email}`);

    } catch (error) {
      console.error('Error sending payment failed email:', error);
      throw error;
    }
  }

  private getRoomName(roomId: string, isHungarian: boolean): string {
    const roomNames = {
      'studio-a': isHungarian ? 'A Stúdió' : 'Studio A',
      'studio-b': isHungarian ? 'B Stúdió' : 'Studio B',
      'studio-c': isHungarian ? 'C Stúdió' : 'Studio C',
    };
    
    return roomNames[roomId as keyof typeof roomNames] || roomId;
  }

  private formatDate(dateStr: string, isHungarian: boolean): string {
    const date = new Date(dateStr);
    
    if (isHungarian) {
      return date.toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    }
  }

  /**
   * Generate iCalendar file content for booking
   */
  generateCalendarFile(order: Order, items: OrderItem[]): string {
    const events = items.map(item => {
      const startDate = new Date(`${item.booking_date}T${item.start_time}:00.000Z`);
      const endDate = new Date(`${item.booking_date}T${item.end_time}:00.000Z`);
      
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      return `BEGIN:VEVENT
UID:${item.id}@photostudio.com
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Photo Studio Booking - ${this.getRoomName(item.room_id, order.language === 'hu')}
DESCRIPTION:Booking confirmation for ${order.customer_name}\\nBooking Code: ${order.id.slice(-8).toUpperCase()}
LOCATION:Photo Studio
STATUS:CONFIRMED
END:VEVENT`;
    }).join('\n');

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Photo Studio//Booking System//EN
${events}
END:VCALENDAR`;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();


