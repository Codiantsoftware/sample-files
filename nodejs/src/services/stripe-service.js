import Stripe from 'stripe';
import config from '../config';
import logMessage from '../logMessages';

const stripe = new Stripe(config.stripe.secretKey);

export default {
  /**
   * Create a Stripe customer.
   * @param {Object} data - Customer data to create.
   * @returns {Object|false} - Created customer object or false on failure.
   */
  async createCustomer(data) {
    try {
      const customer = await stripe.customers.create(data);
      logMessage.paymentMessage('customer', { customer, data });
      return customer;
    } catch (error) {
      logMessage.paymentErrorMessage('customer', { error, data });
      throw this.stripeCustomError(error, 1);
    }
  },

  /**
   * Create a payment intent for a specific amount and currency.
   * @param {Object} data - Payment intent data.
   * @returns {Object} - Created payment intent.
   */
  async createPaymentIntent(data) {
    try {
      const result = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        customer: data.customer,
        payment_method_types: ['card'],
      });
      logMessage.paymentMessage('intent', { result, data });
      return result;
    } catch (error) {
      logMessage.paymentErrorMessage('intent', { error, data });
      throw this.stripeCustomError(error, 1);
    }
  },

  /**
   * Retrieve payment information for a given payment intent.
   * @param {Object} data - Payment intent data.
   * @returns {Object} - Retrieved payment information.
   */
  async RetrievePayment(data) {
    try {
      const retrieve = await stripe.paymentIntents.retrieve(data.payment_intent);
      logMessage.paymentMessage('retrievePayment', { retrieve, data });
      return retrieve;
    } catch (error) {
      logMessage.paymentErrorMessage('retrievePayment', { error, data });
      throw this.stripeCustomError(error, 1);
    }
  },

  /**
   * Add a bank account to a Stripe customer.
   * @param {Number} stripeCustomerId - Stripe customer ID.
   * @param {Object} bankObject - Bank account data.
   * @returns {Object|false} - Added bank account object or false on failure.
   */
  async addBank(stripeCustomerId, bankObject) {
    try {
      const customer = await this.retrieveCustomer(stripeCustomerId);
      if (!customer) {
        return false;
      }
      const token = await stripe.tokens.create({
        bank_account: bankObject,
      });
      const result = await stripe.customers.createSource(stripeCustomerId, {
        source: token.id,
      });
      logMessage.paymentMessage('addBank', { result, stripeCustomerId, bankId: result });
      return result;
    } catch (error) {
      logMessage.paymentErrorMessage('addBank', { error, stripeCustomerId });
      throw this.stripeCustomError(error, 1);
    }
  },

  /**
   * Retrieve a Stripe customer by ID.
   * @param {Object} data - Customer data or ID.
   * @returns {Object|false} - Retrieved customer object or false if not found.
   */
  async retrieveCustomer(data) {
    try {
      const result = await stripe.customers.retrieve(data);
      if (result) {
        logMessage.paymentMessage('customer', { result, data });
        return result;
      }
      return false;
    } catch (error) {
      logMessage.paymentErrorMessage('customerRetrieve', { error, data });
      throw this.stripeCustomError(error, 1);
    }
  },

  /**
   * Store business account creation data.
  * @param {Object} object - Business account data.
   * @returns {Object} - Created business account data.
   */
  async storeAccountCreate(object) {
    try {
      const result = await stripe.accounts.create(object);
      logMessage.paymentMessage('storeAccountCreate', { result, object });
      return result;
    } catch (error) {
      logMessage.paymentErrorMessage('storeAccountCreate', { error, data: object });
      throw this.stripeCustomError(error, 1);
    }
  },

  /**
   * Refund a payment amount.
   * @param {Object} paymentInfo - Payment information.
   * @returns {Object} - Refund information.
   */
  async refundAmount(paymentInfo) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentInfo.paymentIntentId,
        amount: Math.round(paymentInfo.refundAmount * 100),
      });
      logMessage.paymentMessage('refundAmount', { result: refund, data: paymentInfo });
      return refund;
    } catch (error) {
      logMessage.paymentErrorMessage('refundAmount', { error, data: paymentInfo });
      throw this.stripeCustomError(error, 1);
    }
  },

  /**
   * Create a transfer.
   * @param {Object} transferInfo - Transfer information.
   * @returns {Object|false} - Created transfer object or false on failure.
   */
  async createTransfers(transferInfo) {
    try {
      let result;
      const account = await stripe.accounts.retrieve(transferInfo?.destination);
      if (account && account.capabilities.transfers === 'active') {
        logMessage.paymentMessage('createTransfers', { result: account, data: transferInfo });
        result = await stripe.transfers.create(transferInfo);
      } else {
        result = false;
      }
      return result;
    } catch (error) {
      logMessage.paymentErrorMessage('createTransfers', { error, data: transferInfo });
      throw this.stripeCustomError(error, 1);
    }
  },

  /**
   * Create a custom Stripe error with an error code.
   * @param {string} error - Error message.
   * @param {number} errorCode - Error code.
   * @returns {Object} - Custom error object.
   */
  stripeCustomError(error, errorCode) {
    return Object.assign(Error(error), { errorCode });
  },

  /**
   * List bank accounts or cards associated with a Stripe customer.
   * @param {Number} stripeCustomerId - Stripe customer ID.
   * @param {Number} limit - Maximum number of items to list.
   * @param {string} [listType='bank_account'] - Type of items to list (bank_account or card).
   * @returns {Object|false} - List of bank accounts or cards or false on failure.
   */
  async listBankAndCard(stripeCustomerId, limit, listType = 'bank_account') {
    try {
      const customer = await this.retrieveCustomer(stripeCustomerId);
      if (!customer) {
        return false;
      }
      const result = await stripe.customers.listSources(stripeCustomerId, {
        object: listType,
        limit: parseInt(limit, 10) ?? 3,
      });
      return result;
    } catch (error) {
      logMessage.paymentErrorMessage('listBankAccount', { error });
      throw this.stripeCustomError(error, 1);
    }
  },

  /**
   * Delete a bank account or card associated with a Stripe customer.
   * @param {Number} stripeCustomerId - Stripe customer ID.
   * @param {Number} bankId - Bank account or card ID.
   * @returns {Object|false} - Deleted bank account or card object or false on failure.
   */
  async deleteBank(stripeCustomerId, bankId) {
    try {
      const customer = await this.retrieveCustomer(stripeCustomerId);
      if (!customer) {
        return false;
      }
      const result = await stripe.customers.deleteSource(stripeCustomerId, bankId);
      return result;
    } catch (error) {
      logMessage.paymentErrorMessage('deleteBankAccount', { error });
      throw this.stripeCustomError(error, 1);
    }
  },
};
