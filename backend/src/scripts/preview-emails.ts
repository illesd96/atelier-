/**
 * Email template preview server (development only).
 *
 * Renders every Handlebars email template with realistic sample data so the
 * templates can be designed in a browser without sending mail. Templates are
 * read from disk on every request, so editing a .html file and refreshing the
 * page is enough to see the change.
 *
 *   npm run preview-emails    ->  http://localhost:3002
 */
import express from 'express';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

const PORT = parseInt(process.env.EMAIL_PREVIEW_PORT || '3002');
const TEMPLATES_DIR = path.join(__dirname, '../templates/emails');

type Language = 'hu' | 'en';

interface TemplateInfo {
  /** file name without .html */
  key: string;
  file: string;
  label: string;
  /** Subject line the real mailer uses, for context while designing */
  subject: (lang: Language) => string;
  sampleData: (lang: Language) => Record<string, unknown>;
}

const ORDER_ID = 'a1c93f7e-52b8-4d6a-9f21-7c4e8b1d0932';
const BOOKING_CODE = ORDER_ID.slice(-8).toUpperCase();

/** Booking rows as email.ts builds them, including a makeup room and an event */
const sampleItems = (lang: Language) => {
  const hu = lang === 'hu';
  return [
    {
      room_name: 'Atelier',
      formatted_date: hu ? '2026. december 20., vasárnap' : 'Sunday, December 20, 2026',
      formatted_time: '10:00 - 11:00',
      booking_id: 'BK-1766221200000-k3f9a2m1x',
      checkin_code: 'F7K2QW',
    },
    {
      room_name: 'Smink hely 1',
      formatted_date: hu ? '2026. december 20., vasárnap' : 'Sunday, December 20, 2026',
      formatted_time: '09:30 - 10:00',
      booking_id: 'BK-1766221200001-p8s4d7c2v',
      checkin_code: 'M4XR8T',
    },
    {
      room_name: 'Karinthy - Nyílt nap 2.0.',
      special_event_name: 'Nyílt nap 2.0.',
      formatted_date: hu ? '2026. december 21., hétfő' : 'Monday, December 21, 2026',
      formatted_time: '16:00 - 18:00',
      booking_id: 'BK-1766307600000-q2w9e5r7t',
      checkin_code: 'B9ND3L',
    },
  ];
};

const TEMPLATES: TemplateInfo[] = [
  {
    key: 'confirmation',
    file: 'confirmation.html',
    label: 'Booking confirmation',
    subject: lang =>
      lang === 'hu'
        ? `Foglalás megerősítve - ${BOOKING_CODE}`
        : `Booking Confirmed - ${BOOKING_CODE}`,
    sampleData: lang => ({
      customerName: lang === 'hu' ? 'Kovács Anna' : 'Anna Kovacs',
      orderId: ORDER_ID,
      items: sampleItems(lang),
      total: (28000).toLocaleString(),
      currency: lang === 'hu' ? 'Ft' : 'HUF',
      cancelUrl: `http://localhost:3000/booking/cancel?code=${ORDER_ID}`,
      rescheduleUrl: `http://localhost:3000/booking/reschedule?code=${ORDER_ID}`,
      language: lang,
      isHungarian: lang === 'hu',
      hasInvoice: true,
      hasCalendar: true,
    }),
  },
  {
    key: 'reminder',
    file: 'reminder.html',
    label: 'Booking reminder (day before)',
    subject: lang =>
      lang === 'hu'
        ? `⏰ Emlékeztető: Holnap esedékes a foglalása - ${BOOKING_CODE}`
        : `⏰ Reminder: Your booking is tomorrow - ${BOOKING_CODE}`,
    sampleData: lang => ({
      customerName: lang === 'hu' ? 'Kovács Anna' : 'Anna Kovacs',
      orderId: ORDER_ID,
      bookingCode: BOOKING_CODE,
      items: sampleItems(lang),
      viewBookingUrl: 'http://localhost:3000/profile',
      contactUrl: 'http://localhost:3000/contact',
      // Guests who booked without an account never get the account-only button
      hasAccount: true,
      language: lang,
      isHungarian: lang === 'hu',
    }),
  },
  {
    key: 'cancellation',
    file: 'cancellation.html',
    label: 'Booking cancelled',
    subject: lang =>
      lang === 'hu'
        ? `Foglalás lemondva - ${BOOKING_CODE}`
        : `Booking Cancelled - ${BOOKING_CODE}`,
    sampleData: lang => ({
      customerName: lang === 'hu' ? 'Kovács Anna' : 'Anna Kovacs',
      orderId: ORDER_ID,
      bookingCode: BOOKING_CODE,
      items: sampleItems(lang),
      total: (28000).toLocaleString(),
      currency: lang === 'hu' ? 'Ft' : 'HUF',
      language: lang,
      isHungarian: lang === 'hu',
    }),
  },
  {
    key: 'payment-failed',
    file: 'payment-failed.html',
    label: 'Payment failed',
    subject: lang =>
      lang === 'hu'
        ? `Sikertelen fizetés - ${BOOKING_CODE}`
        : `Payment Failed - ${BOOKING_CODE}`,
    sampleData: lang => ({
      customerName: lang === 'hu' ? 'Kovács Anna' : 'Anna Kovacs',
      orderId: ORDER_ID,
      bookingCode: BOOKING_CODE,
      items: sampleItems(lang),
      total: (28000).toLocaleString(),
      currency: lang === 'hu' ? 'Ft' : 'HUF',
      retryUrl: `http://localhost:3000/checkout?orderId=${ORDER_ID}`,
      language: lang,
      isHungarian: lang === 'hu',
    }),
  },
  {
    key: 'email-verification',
    file: 'email-verification.html',
    label: 'Email verification',
    subject: () => '📧 Email cím megerősítése / Verify Your Email Address',
    sampleData: lang => ({
      name: lang === 'hu' ? 'Kovács Anna' : 'Anna Kovacs',
      verificationUrl: 'http://localhost:3000/verify-email?token=sample-token-123456',
      language: lang,
      isHungarian: lang === 'hu',
      couponCode: 'WELCOME10',
      hasCoupon: true,
    }),
  },
];

const renderTemplate = (info: TemplateInfo, lang: Language): string => {
  // Read every time so edits show up on refresh without restarting
  const source = fs.readFileSync(path.join(TEMPLATES_DIR, info.file), 'utf8');
  return Handlebars.compile(source)(info.sampleData(lang));
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Pull the body out of a rendered email so several can sit on one print page.
 * The <style> block is dropped on purpose: it only holds resets and mobile
 * media queries, and leaving it out keeps it from leaking onto the print sheet.
 * All of the visual styling is inline on the elements, so nothing is lost.
 */
const bodyForPrint = (html: string): string => {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return (body ? body[1] : html)
    // The hidden inbox preview line is meaningless on paper
    .replace(/<div style="display:none[\s\S]*?<\/div>/i, '');
};

const printSheet = (infos: TemplateInfo[], lang: Language): string => {
  // Nothing but the emails themselves go on the page
  const sheets = infos.map(info => {
    let rendered: string;
    try {
      rendered = bodyForPrint(renderTemplate(info, lang));
    } catch (error) {
      rendered = `<p style="color:#b91c1c;">Render error: ${escapeHtml(String(error))}</p>`;
    }
    return `<section class="sheet">${rendered}</section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <title>Atelier Archilles - e-mail sablonok (${lang.toUpperCase()})</title>
  <style>
    @page { size: A4; margin: 10mm; }
    body { margin: 0; background: #eef1f5; color: #1f2937;
           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .toolbar { position: sticky; top: 0; z-index: 10; display: flex; gap: 12px; align-items: center;
               flex-wrap: wrap; padding: 14px 20px; background: #1a1a1a; color: #fff; }
    .toolbar button { padding: 9px 20px; border: 0; border-radius: 4px; cursor: pointer;
                      background: #b08550; color: #fff; font-weight: 600; font-size: 14px; }
    .toolbar span { font-size: 13px; color: #cfcfcf; }
    .sheet { max-width: 680px; margin: 22px auto; background: #fff; border: 1px solid #e5e7eb; }

    @media print {
      /* Keep the beige page, the gold rules and the dark code panels in the PDF */
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { background: #fff; }
      .toolbar { display: none; }
      .sheet { border: 0; margin: 0; max-width: none;
               page-break-after: always; break-after: page; }
      .sheet:last-child { page-break-after: auto; break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button onclick="window.print()">Mentés PDF-ként</button>
    <span>Cél: "PDF mentése" &middot; a További beállításoknál kapcsold ki a "Fejlécek és láblécek" opciót</span>
  </div>

  ${sheets}
</body>
</html>`;
};

const app = express();

app.get('/', (req, res) => {
  const lang: Language = req.query.lang === 'en' ? 'en' : 'hu';
  const other: Language = lang === 'hu' ? 'en' : 'hu';

  const cards = TEMPLATES.map(info => {
    let status = '';
    try {
      renderTemplate(info, lang);
    } catch (error) {
      status = `<p class="error">Render error: ${escapeHtml(String(error))}</p>`;
    }

    return `
      <section class="card">
        <header>
          <div>
            <h2>${escapeHtml(info.label)}</h2>
            <code>src/templates/emails/${escapeHtml(info.file)}</code>
            <p class="subject"><strong>Subject:</strong> ${escapeHtml(info.subject(lang))}</p>
          </div>
          <div class="card-links">
            <a class="open" href="/preview/${info.key}?lang=${lang}" target="_blank">Open full size &rarr;</a>
            <a class="open" href="/print/${info.key}?lang=${lang}" target="_blank">PDF &rarr;</a>
          </div>
        </header>
        ${status}
        <iframe src="/preview/${info.key}?lang=${lang}" title="${escapeHtml(info.label)}"></iframe>
      </section>`;
  }).join('\n');

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Email templates preview</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           margin: 0; padding: 24px; background: #eef1f5; color: #1f2937; }
    h1 { margin: 0 0 4px; }
    .hint { color: #6b7280; margin: 0 0 20px; }
    .toolbar { margin-bottom: 24px; display: flex; gap: 10px; flex-wrap: wrap; }
    .toolbar a { display: inline-block; padding: 8px 16px; border-radius: 6px;
                 background: #c49c5f; color: white; text-decoration: none; font-weight: 600; }
    .toolbar a.pdf { background: #1a1a1a; }
    .card-links { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
    .card { background: white; border-radius: 10px; padding: 16px; margin-bottom: 24px;
            box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .card header { display: flex; justify-content: space-between; align-items: flex-start;
                   gap: 16px; margin-bottom: 12px; }
    .card h2 { margin: 0 0 4px; font-size: 1.1rem; }
    .card code { color: #6b7280; font-size: .8rem; }
    .subject { margin: 6px 0 0; font-size: .85rem; color: #374151; }
    .open { white-space: nowrap; color: #b45309; text-decoration: none; font-weight: 600; }
    .error { color: #b91c1c; font-weight: 600; }
    iframe { width: 100%; max-width: 680px; height: 700px; border: 1px solid #e5e7eb;
             border-radius: 6px; background: white; }
  </style>
</head>
<body>
  <h1>Email templates</h1>
  <p class="hint">Rendered with sample data. Edit a file in
     <code>backend/src/templates/emails/</code> and refresh this page.</p>
  <div class="toolbar">
    <a href="/?lang=${other}">Switch to ${other === 'hu' ? 'Hungarian' : 'English'}</a>
    <a class="pdf" href="/print?lang=hu" target="_blank">PDF &ndash; magyar</a>
    <a class="pdf" href="/print?lang=en" target="_blank">PDF &ndash; English</a>
  </div>
  ${cards}
</body>
</html>`);
});

// Printable sheet of every template, for saving as a PDF to send for approval
app.get('/print', (req, res) => {
  const lang: Language = req.query.lang === 'en' ? 'en' : 'hu';
  res.send(printSheet(TEMPLATES, lang));
});

// Printable sheet of a single template
app.get('/print/:key', (req, res) => {
  const info = TEMPLATES.find(t => t.key === req.params.key);
  if (!info) {
    return res.status(404).send('Unknown template');
  }
  const lang: Language = req.query.lang === 'en' ? 'en' : 'hu';
  res.send(printSheet([info], lang));
});

app.get('/preview/:key', (req, res) => {
  const info = TEMPLATES.find(t => t.key === req.params.key);
  if (!info) {
    return res.status(404).send('Unknown template');
  }

  const lang: Language = req.query.lang === 'en' ? 'en' : 'hu';

  try {
    res.send(renderTemplate(info, lang));
  } catch (error) {
    res.status(500).send(`<pre>${escapeHtml(String(error))}</pre>`);
  }
});

app.listen(PORT, () => {
  console.log(`\n📧 Email template preview running at http://localhost:${PORT}`);
  console.log(`   Templates: ${TEMPLATES_DIR}`);
  console.log('   Edit a template and refresh the browser to see the change.\n');
});
