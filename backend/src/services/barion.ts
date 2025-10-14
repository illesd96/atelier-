import axios from 'axios';
import crypto from 'crypto';
import config from '../config';
import { BarionPaymentRequest } from '../types';

class BarionService {
  private apiClient;

  constructor() {
    this.apiClient = axios.create({
      baseURL: config.barion.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async createPayment(paymentData: BarionPaymentRequest): Promise<any> {
    try {
      console.log('🔵 Barion Payment Request:', JSON.stringify(paymentData, null, 2));
      const response = await this.apiClient.post('/v2/Payment/Start', paymentData);
      console.log('✅ Barion Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating Barion payment:', error.message);
      console.error('🔴 Barion Error Response:', JSON.stringify(error.response?.data, null, 2));
      console.error('🔴 Request config:', JSON.stringify({
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }, null, 2));
      throw new Error('Failed to create payment in Barion');
    }
  }

  async getPaymentState(paymentId: string): Promise<any> {
    try {
      const response = await this.apiClient.get('/v2/Payment/GetPaymentState', {
        params: {
          POSKey: config.barion.posKey,
          PaymentId: paymentId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting Barion payment state:', error);
      throw new Error('Failed to get payment state from Barion');
    }
  }

  /**
   * Verify Barion webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', config.barion.posKey)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Create Barion payment request from order data
   */
  createPaymentRequest(
    orderId: string,
    items: Array<{
      name: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }>,
    total: number,
    currency: string = 'HUF',
    locale: 'hu-HU' | 'en-US' = 'hu-HU'
  ): BarionPaymentRequest {
    const paymentRequestId = `order-${orderId}`;
    
    // Validate required Barion configuration
    if (!config.barion.posKey) {
      console.error('❌ BARION_POS_KEY is not configured!');
      throw new Error('Barion POS Key is not configured');
    }
    
    if (!config.barion.payeeEmail) {
      console.error('❌ BARION_PAYEE_EMAIL is not configured!');
      throw new Error('Barion Payee Email is not configured');
    }
    
    console.log('🔧 Barion Configuration:', {
      environment: config.barion.environment,
      baseUrl: config.barion.baseUrl,
      posKey: config.barion.posKey.substring(0, 10) + '...',
      payeeEmail: config.barion.payeeEmail,
      frontendUrl: config.frontendUrl,
      backendUrl: config.backendUrl,
    });
    
    return {
      POSKey: config.barion.posKey,
      PaymentType: 'Immediate',
      GuestCheckOut: true,
      FundingSources: ['All'],
      PaymentRequestId: paymentRequestId,
      Locale: locale,
      Currency: currency as 'HUF' | 'EUR',
      Transactions: [
        {
          POSTransactionId: `trans-${orderId}`,
          Payee: config.barion.payeeEmail, // Changed from posKey to payeeEmail
          Total: total,
          Items: items.map((item, index) => ({
            Name: item.name,
            Description: item.description,
            Quantity: item.quantity,
            Unit: 'hour',
            UnitPrice: item.unitPrice,
            ItemTotal: item.quantity * item.unitPrice,
            SKU: `item-${index + 1}`,
          })),
        },
      ],
      RedirectUrl: `${config.frontendUrl}/payment/result?orderId=${orderId}`,
      CallbackUrl: `${config.backendUrl}/api/webhooks/barion`, // Changed to use backendUrl
    };
  }
}

export default new BarionService();


