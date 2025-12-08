/**
 * GoogleBillingService.ts
 * Wraps the Digital Goods API to handle In-App Purchases on Android TWA.
 */

const PLAY_BILLING_SERVICE = "https://play.google.com/billing";
const PREMIUM_SKU = "com.felis.apexhunter.premium";

// Mock implementation for Dev/Browser testing
const MOCK_SERVICE = {
    getDetails: async (_skus: string[]) => [{
        itemId: PREMIUM_SKU,
        title: "Apex Hunter Premium (Dev Mock)",
        description: "Unlocks all features",
        price: { currency: "EUR", value: "1.99" }
    }],
    acknowledge: async () => { },
    consume: async () => { }
};

export class GoogleBillingService {
    private service: DigitalGoodsService | null = null;
    public isAvailable = false;

    async initialize() {
        try {
            if ('getDigitalGoodsService' in window) {
                this.service = await window.getDigitalGoodsService(PLAY_BILLING_SERVICE);
                this.isAvailable = true;
                console.log("✅ Digital Goods API Connected");
            } else {
                console.warn("⚠️ Digital Goods API not available (Browser or iOS)");
            }
        } catch (error) {
            console.error("❌ Failed to init Digital Goods:", error);
        }
    }

    async getProductDetails() {
        if (!this.service) {
            if (import.meta.env.DEV) {
                const mockDetails = await MOCK_SERVICE.getDetails([PREMIUM_SKU]);
                return mockDetails[0];
            }
            return null;
        }

        try {
            const details = await this.service.getDetails([PREMIUM_SKU]);
            return details[0] || null;
        } catch (error) {
            console.error("Failed to fetch SKU details:", error);
            return null;
        }
    }

    async purchasePremium(): Promise<{ success: boolean, token?: string }> {
        if (!window.PaymentRequest) {
            console.error("PaymentRequest API not supported");
            return { success: false };
        }

        const methods = [{
            supportedMethods: PLAY_BILLING_SERVICE,
            data: {
                sku: PREMIUM_SKU
            }
        }];

        const details = {
            total: {
                label: "Apex Hunter Premium",
                amount: { currency: "EUR", value: "1.99" } // Google ignores this, uses Store price
            }
        };

        try {
            const request = new PaymentRequest(methods, details);
            const response = await request.show();

            // Extract the Purchase Token from response.details
            const { purchaseToken } = response.details;

            // IMPORTANT: In PROD, we would verify this token with our Backend here.
            // For now, we trust the Purchase Request succeeded and Acknowledge it.

            if (this.service) {
                await this.service.acknowledge(purchaseToken, 'onetime');
            }

            await response.complete('success');
            return { success: true, token: purchaseToken };

        } catch (error) {
            console.error("Purchase failed or cancelled:", error);
            return { success: false }; // User likely cancelled
        }
    }

    /**
     * Checks if user already owns the item (restore purchases)
     */
    async checkOwnership(): Promise<boolean> {
        if (!this.service) return false;

        try {
            // Some browsers implementation of listPurchases might vary, keeping it simple
            // Note: Digital Goods API 2.0 uses 'listPurchases'
            const purchases = await this.service.listPurchases();
            const premium = purchases.find(p => p.itemId === PREMIUM_SKU);

            return !!premium; // True if found
        } catch (error) {
            console.warn("Could not check ownership:", error);
            return false;
        }
    }
}

export const billingService = new GoogleBillingService();
