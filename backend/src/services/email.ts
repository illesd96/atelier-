import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import config from '../config';
import { Order, OrderItem } from '../types';
import pool from '../database/connection';

class EmailService {
  private transporter;
  private templates: Record<string, HandlebarsTemplateDelegate> = {};

  constructor() {
    // Configure transporter for Gmail/Google Workspace
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Use 'gmail' service for better compatibility
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465, // true for 465, false for other ports
      auth: {
        user: config.email.user,
        pass: config.email.pass, // Use App Password for Google accounts
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates (for development)
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

      // Load reminder template
      const reminderHtml = fs.readFileSync(
        path.join(templatesDir, 'reminder.html'), 
        'utf8'
      );
      this.templates['reminder'] = Handlebars.compile(reminderHtml);

      // Load email verification template
      const verificationHtml = fs.readFileSync(
        path.join(templatesDir, 'email-verification.html'), 
        'utf8'
      );
      this.templates['verification'] = Handlebars.compile(verificationHtml);

    } catch (error) {
      console.error('Error loading email templates:', error);
    }
  }

  async sendBookingConfirmation(
    order: Order,
    items: OrderItem[],
    calendarFile?: Buffer,
    invoicePdf?: Buffer
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
        items: items.map(item => ({
          ...item,
          booking_id: item.booking_id,
          checkin_code: item.checkin_code,
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
        hasInvoice: !!invoicePdf,
      });

      const attachments: any[] = [];
      if (calendarFile) {
        attachments.push({
          filename: 'booking.ics',
          content: calendarFile,
          contentType: 'text/calendar',
        });
      }
      
      if (invoicePdf) {
        attachments.push({
          filename: `szamla-${order.id.slice(-8).toUpperCase()}.pdf`,
          content: invoicePdf,
          contentType: 'application/pdf',
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

      console.log(`Confirmation email sent to ${order.email}${invoicePdf ? ' (with invoice)' : ''}`);

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
      'studio-a': 'Atelier',
      'studio-b': 'Frigyes',
      'studio-c': 'Karinthy',
    };
    
    return roomNames[roomId as keyof typeof roomNames] || roomId;
  }

  private formatDate(dateStr: string | Date, isHungarian: boolean): string {
    // Handle both string and Date object inputs
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
    // Validate date
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateStr);
      return String(dateStr); // Return original value if invalid
    }
    
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
    const now = new Date();
    const formatDateStamp = (date: Date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    };

    const events = items.map(item => {
      // Parse booking_date (format: YYYY-MM-DD)
      const bookingDate: any = item.booking_date;
      const dateStr = typeof bookingDate === 'string' 
        ? bookingDate
        : (bookingDate instanceof Date ? bookingDate.toISOString().split('T')[0] : String(bookingDate));
      
      // Parse times (format: HH:MM)
      const startTime: any = item.start_time;
      const startTimeStr = typeof startTime === 'string'
        ? startTime
        : (startTime instanceof Date ? startTime.toTimeString().slice(0, 5) : String(startTime));
      
      const endTime: any = item.end_time;
      const endTimeStr = typeof endTime === 'string'
        ? endTime
        : (endTime instanceof Date ? endTime.toTimeString().slice(0, 5) : String(endTime));
      
      // Create date strings in format YYYYMMDD and time strings in format HHMMSS
      const formatDate = (dateString: string, timeString: string) => {
        const [year, month, day] = dateString.split('-');
        const [hours, minutes] = timeString.split(':');
        return `${year}${month}${day}T${hours}${minutes}00`;
      };

      const startDateTime = formatDate(dateStr, startTimeStr);
      const endDateTime = formatDate(dateStr, endTimeStr);
      const roomName = this.getRoomName(item.room_id, order.language === 'hu');
      const isHungarian = order.language === 'hu';
      
      // Escape special characters in description
      const description = isHungarian
        ? `Fotostudio foglalás - ${order.customer_name}\\nFoglalási kód: ${order.id.slice(-8).toUpperCase()}\\nTerem: ${roomName}`
        : `Photo Studio Booking - ${order.customer_name}\\nBooking Code: ${order.id.slice(-8).toUpperCase()}\\nRoom: ${roomName}`;

      return `BEGIN:VEVENT
UID:${item.id}@atelierarchilles.hu
DTSTAMP:${formatDateStamp(now)}
DTSTART;TZID=Europe/Budapest:${startDateTime}
DTEND;TZID=Europe/Budapest:${endDateTime}
SUMMARY:${isHungarian ? 'Atelier Archilles - ' : 'Atelier Archilles - '}${roomName}
DESCRIPTION:${description}
LOCATION:Atelier Archilles\\, Budapest\\, Hungary
ORGANIZER;CN=Atelier Archilles:MAILTO:studio@archilles.hu
STATUS:CONFIRMED
SEQUENCE:0
TRANSP:OPAQUE
END:VEVENT`;
    }).join('\r\n');

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Atelier Archilles//Booking System//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VTIMEZONE
TZID:Europe/Budapest
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
${events}
END:VCALENDAR`;
  }

  async sendBookingReminder(
    order: Order,
    items: OrderItem[]
  ): Promise<void> {
    try {
      const template = this.templates['reminder'];
      if (!template) {
        throw new Error('Reminder email template not found');
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
        viewBookingUrl: `${config.frontendUrl}/profile`,
        contactUrl: `${config.frontendUrl}/contact`,
        language: order.language,
        isHungarian,
      });

      await this.transporter.sendMail({
        from: `${config.email.fromName} <${config.email.from}>`,
        to: order.email,
        subject: isHungarian 
          ? `⏰ Emlékeztető: Holnap esedékes a foglalása - ${order.id.slice(-8).toUpperCase()}`
          : `⏰ Reminder: Your booking is tomorrow - ${order.id.slice(-8).toUpperCase()}`,
        html,
      });

      console.log(`Reminder email sent to ${order.email}`);

    } catch (error) {
      console.error('Error sending reminder email:', error);
      throw error;
    }
  }

  /**
   * Get bookings that need reminders (24 hours before booking date)
   */
  async getBookingsForReminder(): Promise<Array<{ order: Order; items: OrderItem[] }>> {
    try {
      // Get bookings that are tomorrow (24 hours from now)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split('T')[0];

      const result = await pool.query(`
        SELECT 
          o.id as order_id,
          o.email,
          o.customer_name,
          o.language,
          o.total_amount,
          o.status as order_status,
          o.created_at,
          json_agg(
            json_build_object(
              'id', oi.id,
              'room_id', oi.room_id,
              'room_name', r.name,
              'booking_date', oi.booking_date,
              'start_time', to_char(oi.start_time, 'HH24:MI'),
              'end_time', to_char(oi.end_time, 'HH24:MI'),
              'status', oi.status
            )
          ) as items
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN rooms r ON r.id = oi.room_id
        WHERE o.status = 'paid'
        AND oi.status = 'booked'
        AND oi.booking_date = $1
        AND NOT EXISTS (
          SELECT 1 FROM email_logs el
          WHERE el.order_id = o.id
          AND el.email_type = 'reminder'
          AND el.booking_date = oi.booking_date
        )
        GROUP BY o.id
      `, [tomorrowDate]);

      return result.rows.map(row => ({
        order: {
          id: row.order_id,
          email: row.email,
          customer_name: row.customer_name,
          language: row.language,
          total_amount: row.total_amount,
          status: row.order_status,
          created_at: row.created_at,
        } as Order,
        items: row.items,
      }));

    } catch (error) {
      console.error('Error getting bookings for reminder:', error);
      return [];
    }
  }

  /**
   * Log sent email to avoid duplicate reminders
   */
  async logEmail(orderId: string, emailType: string, bookingDate: string): Promise<void> {
    try {
      await pool.query(`
        INSERT INTO email_logs (order_id, email_type, booking_date, sent_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      `, [orderId, emailType, bookingDate]);
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }

  /**
   * Send email verification link to new users
   */
  async sendEmailVerification(
    email: string,
    name: string,
    verificationToken: string,
    language: string = 'en'
  ): Promise<void> {
    try {
      const template = this.templates['verification'];
      if (!template) {
        throw new Error('Email verification template not found');
      }

      const isHungarian = language === 'hu';
      const verificationUrl = `${config.frontendUrl}/verify-email?token=${verificationToken}`;
      
      const html = template({
        name,
        verificationUrl,
        language,
        isHungarian,
      });

      await this.transporter.sendMail({
        from: `${config.email.fromName} <${config.email.from}>`,
        to: email,
        subject: '📧 Email cím megerősítése / Verify Your Email Address',
        html,
      });

      console.log(`Verification email sent to ${email}`);

    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }
}

export default new EmailService();


