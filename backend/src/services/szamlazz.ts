import axios from 'axios';
import FormData from 'form-data';
import { parseString } from 'xml2js';
import config from '../config';
import pool from '../database/connection';

// Wrap parseString in a Promise
const parseXml = (xml: string, options?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    parseString(xml, options || {}, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

interface InvoiceItem {
  name: string;
  quantity: number;
  unit: string;
  netUnitPrice: number;
  vatRate: number;
  netPrice: number;
  vatAmount: number;
  grossAmount: number;
}

interface InvoiceCustomer {
  name: string;
  email: string;
  phone?: string;
  taxNumber?: string;
  country?: string;
  zip?: string;
  city?: string;
  address?: string;
}

interface InvoiceData {
  orderId: string;
  customer: InvoiceCustomer;
  items: InvoiceItem[];
  paymentMethod: string;
  currency: string;
  language: string;
  comment?: string;
}

interface InvoiceResponse {
  success: boolean;
  invoiceNumber?: string;
  invoiceId?: string;
  pdfData?: Buffer;
  netAmount?: number;
  grossAmount?: number;
  errorMessage?: string;
}

class SzamlazzService {
  private apiUrl: string;
  private username: string;
  private password: string;
  private agentKey: string;
  private enabled: boolean;

  constructor() {
    this.apiUrl = config.szamlazz.apiUrl;
    this.username = config.szamlazz.username;
    this.password = config.szamlazz.password;
    this.agentKey = config.szamlazz.agentKey;
    this.enabled = config.szamlazz.enabled;
  }

  /**
   * Check if Szamlazz.hu integration is enabled
   */
  isEnabled(): boolean {
    return this.enabled && !!this.username && !!this.password;
  }

  /**
   * Generate XML for invoice creation
   */
  private generateInvoiceXml(data: InvoiceData): string {
    const { customer, items, paymentMethod, currency, language, comment } = data;

    // Calculate totals
    const netAmount = items.reduce((sum, item) => sum + item.netPrice, 0);
    const vatAmount = items.reduce((sum, item) => sum + item.vatAmount, 0);
    const grossAmount = items.reduce((sum, item) => sum + item.grossAmount, 0);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<xmlszamla xmlns="http://www.szamlazz.hu/xmlszamla" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.szamlazz.hu/xmlszamla https://www.szamlazz.hu/szamla/docs/xsds/agent/xmlszamla.xsd">
  <beallitasok>
    <felhasznalo>${this.escapeXml(this.username)}</felhasznalo>
    <jelszo>${this.escapeXml(this.password)}</jelszo>
    ${this.agentKey ? `<szamlaagentkulcs>${this.escapeXml(this.agentKey)}</szamlaagentkulcs>` : ''}
    <eszamla>true</eszamla>
    <szamlaLetoltes>true</szamlaLetoltes>
    <valaszVerzio>2</valaszVerzio>
  </beallitasok>
  <fejlec>
    <keltDatum>${new Date().toISOString().split('T')[0]}</keltDatum>
    <teljesitesDatum>${new Date().toISOString().split('T')[0]}</teljesitesDatum>
    <fizetesiHataridoDatum>${new Date().toISOString().split('T')[0]}</fizetesiHataridoDatum>
    <fizmod>${this.escapeXml(paymentMethod)}</fizmod>
    <penznem>${this.escapeXml(currency)}</penznem>
    <szamlaNyelve>${this.escapeXml(language)}</szamlaNyelve>
    ${comment ? `<megjegyzes>${this.escapeXml(comment)}</megjegyzes>` : ''}
    <rendelesSzam>${this.escapeXml(data.orderId)}</rendelesSzam>
    ${config.szamlazz.invoice.invoicePrefix ? `<elolegszamla>${this.escapeXml(config.szamlazz.invoice.invoicePrefix)}</elolegszamla>` : ''}
    ${config.szamlazz.seller.bank ? `<bank>${this.escapeXml(config.szamlazz.seller.bank)}</bank>` : ''}
    ${config.szamlazz.seller.bankAccountNumber ? `<bankszamlaszam>${this.escapeXml(config.szamlazz.seller.bankAccountNumber)}</bankszamlaszam>` : ''}
  </fejlec>
  <elado>
    ${config.szamlazz.seller.emailReplyTo ? `<emailReplyto>${this.escapeXml(config.szamlazz.seller.emailReplyTo)}</emailReplyto>` : ''}
    ${config.szamlazz.seller.emailSubject ? `<emailTargy>${this.escapeXml(config.szamlazz.seller.emailSubject)}</emailTargy>` : ''}
    ${config.szamlazz.seller.emailText ? `<emailSzoveg>${this.escapeXml(config.szamlazz.seller.emailText)}</emailSzoveg>` : ''}
  </elado>
  <vevo>
    <nev>${this.escapeXml(customer.name)}</nev>
    ${customer.country ? `<orszag>${this.escapeXml(customer.country)}</orszag>` : '<orszag>HU</orszag>'}
    ${customer.zip ? `<irsz>${this.escapeXml(customer.zip)}</irsz>` : ''}
    ${customer.city ? `<telepules>${this.escapeXml(customer.city)}</telepules>` : ''}
    ${customer.address ? `<cim>${this.escapeXml(customer.address)}</cim>` : ''}
    <email>${this.escapeXml(customer.email)}</email>
    ${customer.phone ? `<telefonszam>${this.escapeXml(customer.phone)}</telefonszam>` : ''}
    ${customer.taxNumber ? `<adoszam>${this.escapeXml(customer.taxNumber)}</adoszam>` : ''}
    <sendEmail>true</sendEmail>
  </vevo>
  <tetelek>
${items.map(item => `    <tetel>
      <megnevezes>${this.escapeXml(item.name)}</megnevezes>
      <mennyiseg>${item.quantity}</mennyiseg>
      <mennyisegiEgyseg>${this.escapeXml(item.unit)}</mennyisegiEgyseg>
      <nettoEgysegar>${item.netUnitPrice}</nettoEgysegar>
      <afakulcs>${item.vatRate}</afakulcs>
      <nettoErtek>${item.netPrice}</nettoErtek>
      <afaErtek>${item.vatAmount}</afaErtek>
      <bruttoErtek>${item.grossAmount}</bruttoErtek>
    </tetel>`).join('\n')}
  </tetelek>
</xmlszamla>`;

    return xml;
  }

  /**
   * Escape special XML characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Parse Szamlazz.hu XML response
   */
  private async parseResponse(xml: string): Promise<any> {
    try {
      const result = await parseXml(xml, { explicitArray: false });
      return result;
    } catch (error) {
      console.error('Error parsing Szamlazz.hu XML response:', error);
      throw new Error('Failed to parse Szamlazz.hu response');
    }
  }

  /**
   * Create an invoice via Szamlazz.hu API
   */
  async createInvoice(data: InvoiceData): Promise<InvoiceResponse> {
    if (!this.isEnabled()) {
      console.warn('⚠️ Szamlazz.hu is disabled or not configured');
      return {
        success: false,
        errorMessage: 'Szamlazz.hu integration is not enabled',
      };
    }

    try {
      console.log('📄 Generating invoice for order:', data.orderId);

      // Generate XML request
      const xmlData = this.generateInvoiceXml(data);

      // Create form data with XML file
      const form = new FormData();
      form.append('action-xmlagentxmlfile', Buffer.from(xmlData, 'utf-8'), {
        filename: 'invoice.xml',
        contentType: 'text/xml',
      });

      // Send request to Szamlazz.hu
      const response = await axios.post(this.apiUrl, form, {
        headers: {
          ...form.getHeaders(),
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      // Szamlazz.hu returns multipart response with XML and PDF
      const responseData = response.data;
      
      // Try to parse response as XML first (error responses are XML)
      const responseText = Buffer.from(responseData).toString('utf-8');
      
      if (responseText.includes('<?xml')) {
        // Error response
        const parsed = await this.parseResponse(responseText);
        const errorCode = parsed.xmlszamlavalasz?.hibakod || 'unknown';
        const errorMessage = parsed.xmlszamlavalasz?.hibauzenet || 'Unknown error';
        
        console.error('❌ Szamlazz.hu error:', { errorCode, errorMessage });
        
        return {
          success: false,
          errorMessage: `${errorCode}: ${errorMessage}`,
        };
      }

      // Success response - contains PDF
      console.log('✅ Invoice generated successfully');

      // Parse response to extract invoice details
      // The response format is: XML part + PDF part
      const boundary = '--';
      const parts = responseText.split(boundary);
      
      let invoiceNumber = '';
      let invoiceId = '';
      let pdfData: Buffer | undefined;

      // Find XML part
      for (const part of parts) {
        if (part.includes('Content-Disposition: form-data; name="szamla_id"')) {
          invoiceId = part.split('\r\n\r\n')[1]?.trim() || '';
        } else if (part.includes('Content-Disposition: form-data; name="szamlaszam"')) {
          invoiceNumber = part.split('\r\n\r\n')[1]?.trim() || '';
        } else if (part.includes('Content-Type: application/pdf')) {
          // Extract PDF binary data
          const pdfStart = part.indexOf('\r\n\r\n') + 4;
          if (pdfStart > 3) {
            const pdfContent = part.substring(pdfStart);
            pdfData = Buffer.from(pdfContent, 'binary');
          }
        }
      }

      // If we couldn't parse the multipart response, try to extract PDF directly
      if (!pdfData && responseData.includes('%PDF')) {
        const pdfStartIndex = responseData.indexOf('%PDF');
        pdfData = Buffer.from(responseData.slice(pdfStartIndex));
      }

      return {
        success: true,
        invoiceNumber,
        invoiceId,
        pdfData,
        grossAmount: data.items.reduce((sum, item) => sum + item.grossAmount, 0),
        netAmount: data.items.reduce((sum, item) => sum + item.netPrice, 0),
      };

    } catch (error: any) {
      console.error('Error creating invoice:', error.message);
      return {
        success: false,
        errorMessage: error.message || 'Failed to create invoice',
      };
    }
  }

  /**
   * Save invoice to database
   */
  async saveInvoice(
    orderId: string,
    invoiceResponse: InvoiceResponse,
    customerData: InvoiceCustomer,
    items: InvoiceItem[]
  ): Promise<string | null> {
    if (!invoiceResponse.success) {
      console.error('Cannot save failed invoice');
      return null;
    }

    try {
      const grossAmount = items.reduce((sum, item) => sum + item.grossAmount, 0);
      const netAmount = items.reduce((sum, item) => sum + item.netPrice, 0);
      const vatAmount = items.reduce((sum, item) => sum + item.vatAmount, 0);

      const result = await pool.query(`
        INSERT INTO invoices (
          order_id,
          szamlazz_id,
          invoice_number,
          gross_amount,
          net_amount,
          vat_amount,
          currency,
          customer_name,
          customer_email,
          customer_tax_number,
          pdf_data,
          status,
          szamlazz_response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        orderId,
        invoiceResponse.invoiceId,
        invoiceResponse.invoiceNumber,
        grossAmount,
        netAmount,
        vatAmount,
        config.szamlazz.invoice.currency,
        customerData.name,
        customerData.email,
        customerData.taxNumber || null,
        invoiceResponse.pdfData || null,
        'generated',
        JSON.stringify(invoiceResponse),
      ]);

      const invoiceId = result.rows[0].id;

      // Update order with invoice reference
      await pool.query(`
        UPDATE orders SET invoice_id = $1 WHERE id = $2
      `, [invoiceId, orderId]);

      console.log('✅ Invoice saved to database:', invoiceId);
      return invoiceId;

    } catch (error) {
      console.error('Error saving invoice to database:', error);
      return null;
    }
  }

  /**
   * Get invoice PDF from database
   */
  async getInvoicePdf(invoiceId: string): Promise<Buffer | null> {
    try {
      const result = await pool.query(`
        SELECT pdf_data FROM invoices WHERE id = $1
      `, [invoiceId]);

      if (result.rows.length === 0 || !result.rows[0].pdf_data) {
        return null;
      }

      return result.rows[0].pdf_data;
    } catch (error) {
      console.error('Error getting invoice PDF:', error);
      return null;
    }
  }
}

export default new SzamlazzService();

