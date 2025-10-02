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
      const response = await this.apiClient.post('/v2/Payment/Start', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating Barion payment:', error);
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
          Payee: config.barion.posKey,
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
      CallbackUrl: `${config.frontendUrl.replace('3000', '3001')}/api/webhooks/barion`,
    };
  }
}

export default new BarionService();


