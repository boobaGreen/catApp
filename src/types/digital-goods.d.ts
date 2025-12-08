interface DigitalGoodsService {
    getDetails(skus: string[]): Promise<DigitalGoodsProductDetails[]>;
    acknowledge(purchaseToken: string, purchaseType: 'onetime' | 'subscription'): Promise<void>;
    listPurchases(): Promise<PurchaseDetails[]>;
    consume(purchaseToken: string): Promise<void>;
}

interface DigitalGoodsProductDetails {
    itemId: string;
    title: string;
    description: string;
    price: PaymentCurrencyAmount;
    subscriptionPeriod?: string;
    freeTrialPeriod?: string;
    introductoryPrice?: PaymentCurrencyAmount;
    introductoryPricePeriod?: string;
}

interface PurchaseDetails {
    itemId: string;
    purchaseToken: string;
    acknowledged: boolean;
    purchaseState: 'pending' | 'purchased' | 'cancelled'; // Best guess from spec
    purchaseTime: number; // Timestamp
}

interface PaymentCurrencyAmount {
    currency: string;
    value: string;
}

// Extend the existing Window interface
interface Window {
    getDigitalGoodsService(serviceProvider: string): Promise<DigitalGoodsService>;
}
