//---------Payment Interface (Strategy)-----------
export interface PaymentGateway {
    pay(amount: number): void;
}

//--------Third-Party Gateways (simulate)----------
export class Stripe {
    makePayent(amount: number) {
        console.log("Stripe payment:", amount);
    }
}

export class Paypal {
    sendPayment(amout: number) {
        console.log("Paypal payment:", amout);
    }
}

export class RazorPay {
    createOrder(amount: number) {
        console.log("RazorPay payment:", amount);
    }
}

//-----------Adapter Patterns------------
export class StripeAdapter implements PaymentGateway {
    constructor(private stripe: Stripe) { }

    pay(amount: number) {
        this.stripe.makePayent(amount);
    }
}

export class PaypalAdapter implements PaymentGateway {
    constructor(private paypal: Paypal) { }

    pay(amount: number) {
        this.paypal.sendPayment(amount);
    }
}

export class RazorPayAdapter implements PaymentGateway {
    constructor(private razorPay: RazorPay) { }

    pay(amount: number) {
        this.razorPay.createOrder(amount);
    }
}

//-----------Registry Pattern-------------
export class PaymentRegistry {
    private static gateways = new Map<string, () => PaymentGateway>();

    static register(
        name: string,
        factory: () => PaymentGateway
    ) {
        this.gateways.set(name, factory);
    }

    static resolve(name: string): PaymentGateway {
        const factory = this.gateways.get(name);
        if (!factory) {
            throw new Error(`No factory found for ${name}`);
        }
        return factory();
    }
}

//----------Bootstrap (App Startup)----------
PaymentRegistry.register("stripe", () => new StripeAdapter(new Stripe()));
PaymentRegistry.register("paypal", () => new PaypalAdapter(new Paypal()));
PaymentRegistry.register("razorpay", () => new RazorPayAdapter(new RazorPay()));


//-----------Checkout Service (Business Logic)-----------
export class CheckoutService {
    processPayment(gateWayType:string, amount:number){
        const gateway = PaymentRegistry.resolve(gateWayType);
        gateway.pay(amount);
    }
}

//---------Run Example--------------
const checkout = new CheckoutService();
checkout.processPayment("stripe", 100);
checkout.processPayment("paypal", 100);
checkout.processPayment("razorpay", 100);