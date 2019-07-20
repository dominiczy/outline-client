"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cordova_1 = require("cordova");
const NOOP = () => { };
var CordovaStripe;
(function (CordovaStripe) {
    let SourceType;
    (function (SourceType) {
        SourceType["ThreeDeeSecure"] = "3ds";
        SourceType["GiroPay"] = "giropay";
        SourceType["iDEAL"] = "ideal";
        SourceType["SEPADebit"] = "sepadebit";
        SourceType["Sofort"] = "sofort";
        SourceType["AliPay"] = "alipay";
        SourceType["AliPayReusable"] = "alipayreusable";
        SourceType["P24"] = "p24";
        SourceType["VisaCheckout"] = "visacheckout";
    })(SourceType = CordovaStripe.SourceType || (CordovaStripe.SourceType = {}));
    const SourceTypeArray = Object.keys(SourceType).map(key => SourceType[key]);
    class CordovaStripePlugin {
        /**
         * Set publishable key
         * @param {string} key
         * @param {Function} success
         * @param {Function} error
         */
        static setPublishableKey(key, success = NOOP, error = NOOP) {
            cordova_1.exec(success, error, 'CordovaStripe', 'setPublishableKey', [key]);
        }
        /**
         * Create a credit card token
         * @param {CordovaStripe.CardTokenRequest} creditCard
         * @param {CordovaStripe.CardTokenCallback} success
         * @param {CordovaStripe.ErrorCallback} error
         */
        static createCardToken(creditCard, success = NOOP, error = NOOP) {
            cordova_1.exec(success, error, 'CordovaStripe', 'createCardToken', [creditCard]);
        }
        /**
         * Create a bank account token
         * @param {CordovaStripe.BankAccountTokenRequest} bankAccount
         * @param {Function} success
         * @param {Function} error
         */
        static createBankAccountToken(bankAccount, success = NOOP, error = NOOP) {
            cordova_1.exec(success, error, 'CordovaStripe', 'createBankAccountToken', [bankAccount]);
        }
        /**
         * Validates card number
         * @param cardNumber Card number
         * @param {(isValid: boolean) => void} [success]
         * @param {Function} [error]
         */
        static validateCardNumber(cardNumber, success = NOOP, error = NOOP) {
            cordova_1.exec(success, error, 'CordovaStripe', 'validateCardNumber', [cardNumber]);
        }
        /**
         * Validates the expiry date of a card
         * @param {number} expMonth
         * @param {number} expYear
         * @param {(isValid: boolean) => void} [success]
         * @param {Function} [error]
         */
        static validateExpiryDate(expMonth, expYear, success = NOOP, error = NOOP) {
            cordova_1.exec(success, error, 'CordovaStripe', 'validateExpiryDate', [expMonth, expYear]);
        }
        /**
         * Validates a CVC of a card
         * @param {string} cvc
         * @param {(isValid: boolean) => void} [success]
         * @param {Function} [error]
         */
        static validateCVC(cvc, success = NOOP, error = NOOP) {
            cordova_1.exec(success, error, 'CordovaStripe', 'validateCVC', [cvc]);
        }
        /**
         * Gets a card type from a card number
         * @param {string | number} cardNumber
         * @param {(type: string) => void} [success]
         * @param {Function} [error]
         */
        static getCardType(cardNumber, success = NOOP, error = NOOP) {
            cordova_1.exec(success, error, 'CordovaStripe', 'getCardType', [String(cardNumber)]);
        }
        /**
         * Pay with ApplePay
         * @param {CordovaStripe.ApplePayOptions} options
         * @param {(token: string, callback: (paymentProcessed: boolean) => void) => void} success
         * @param {Function} error
         */
        static payWithApplePay(options, success, error = NOOP) {
            if (!options || !options.merchantId || !options.country || !options.currency ||
                !options.items || !options.items.length) {
                error({ message: 'Missing one or more payment options.' });
                return;
            }
            options.items = options.items.map(item => {
                item.amount = String(item.amount);
                return item;
            });
            cordova_1.exec((token) => {
                success(token, (paymentProcessed) => {
                    cordova_1.exec(NOOP, NOOP, 'CordovaStripe', 'finalizeApplePayTransaction', [Boolean(paymentProcessed)]);
                });
            }, error, 'CordovaStripe', 'initializeApplePayTransaction', [options.merchantId, options.country, options.currency, options.items]);
        }
        static initGooglePay(success = NOOP, error = NOOP) {
            cordova_1.exec(success, error, 'CordovaStripe', 'initGooglePay');
        }
        static payWithGooglePay(options, success, error = NOOP) {
            cordova_1.exec(success, error, 'CordovaStripe', 'payWithGooglePay', [options.amount, options.currencyCode]);
        }
        static createSource(type, params, success = NOOP, error = NOOP) {
            cordova_1.exec(success, error, 'CordovaStripe', 'createSource', [SourceTypeArray.indexOf(type.toLowerCase()), params]);
        }
        static createPiiToken(personalId, success = NOOP, error = NOOP) {
            cordova_1.exec(success, error, 'CordovaStripe', 'createPiiToken', [personalId]);
        }
        static createAccountToken(accountParams, success = NOOP, error = NOOP) {
            cordova_1.exec(success, error, 'CordovaStripe', 'createAccountToken', [accountParams]);
        }
    }
    CordovaStripe.CordovaStripePlugin = CordovaStripePlugin;
})(CordovaStripe = exports.CordovaStripe || (exports.CordovaStripe = {}));
