# Payment Gateway System

## Adapter + Strategy + Registry Pattern Architecture

---

# Introduction

This payment system demonstrates a **production-style backend architecture** using a combination of design patterns:

- Adapter Pattern
- Strategy Pattern
- Registry Pattern (Factory-like behavior)

The goal of this architecture is to:

- Support **multiple payment providers**
- Decouple business logic from external SDKs
- Enable **easy provider switching**
- Follow **SOLID design principles**
- Maintain **scalable and extensible architecture**

This type of structure is commonly used in real-world systems such as:

- Shopify payments
- Uber payments
- SaaS billing systems
- Fintech platforms

---

# Problem Statement

In a typical backend system, we may need to support multiple payment providers:

```
Stripe
PayPal
Razorpay
```

However, each provider exposes a **different API**.

Example:

Stripe

```ts
stripe.makePayment(amount)
```

Paypal

```ts
paypal.sendPayment(amount)
```

Razorpay

```ts
razorpay.createOrder(amount)
```

But our application wants a **consistent interface**:

```ts
pay(amount)
```

Without proper architecture, business logic becomes tightly coupled:

```ts
if (gateway === "stripe") {
  stripe.makePayment(amount)
}

if (gateway === "paypal") {
  paypal.sendPayment(amount)
}
```

Problems with this approach:

- Tight coupling
- Difficult to extend
- Violates Open/Closed Principle
- Business logic depends on external SDKs

To solve this, we apply multiple design patterns.

---

# Architecture Overview

```
CheckoutService
        ↓
PaymentRegistry
        ↓
PaymentGateway (Strategy Interface)
        ↓
Adapter
        ↓
Third-Party SDK
```

Each layer has a clear responsibility.

---

# Core Design Patterns Used

## Adapter Pattern (Structural)

Adapter converts **third-party APIs** into a unified interface.

Example problem:

```
Stripe → makePayment()
Paypal → sendPayment()
Razorpay → createOrder()
```

Application expects:

```
pay()
```

Adapter translates the external API to match our internal interface.

Example:

```ts
class StripeAdapter implements PaymentGateway {

  constructor(private stripe: Stripe) {}

  pay(amount:number){
    this.stripe.makePayment(amount)
  }

}
```

This allows our application to remain **independent of external APIs**.

---

## Strategy Pattern (Behavioral)

Strategy allows **runtime switching of payment behavior**.

Different payment gateways represent different payment strategies.

Example strategy interface:

```ts
export interface PaymentGateway {
  pay(amount:number):void
}
```

Concrete strategies:

```
StripeAdapter
PaypalAdapter
RazorpayAdapter
```

Checkout service interacts only with the **strategy interface**, not the implementation.

---

## Registry Pattern (Factory-like Resolution)

Registry dynamically resolves which payment gateway to use.

Instead of hardcoding logic like:

```
if stripe
if paypal
```

We register gateways during application startup.

Example:

```ts
PaymentRegistry.register(
  "stripe",
  () => new StripeAdapter(new Stripe())
)
```

At runtime:

```ts
const gateway = PaymentRegistry.resolve("stripe")
```

This allows **dynamic provider resolution**.

---

# System Components

---

# 1 PaymentGateway Interface (Strategy Contract)

```ts
export interface PaymentGateway {

  pay(amount:number):void

}
```

This defines the **common behavior for all payment strategies**.

---

# 2 Third Party SDK Simulation

Stripe SDK

```ts
export class Stripe {

  makePayment(amount:number){
    console.log("Stripe payment:", amount)
  }

}
```

Paypal SDK

```ts
export class Paypal {

  sendPayment(amount:number){
    console.log("Paypal payment:", amount)
  }

}
```

Razorpay SDK

```ts
export class Razorpay {

  createOrder(amount:number){
    console.log("Razorpay order:", amount)
  }

}
```

These SDKs have **incompatible interfaces**.

---

# 3 Adapter Implementations

## Stripe Adapter

```ts
export class StripeAdapter implements PaymentGateway {

  constructor(private stripe:Stripe){}

  pay(amount:number){
    this.stripe.makePayment(amount)
  }

}
```

---

## Paypal Adapter

```ts
export class PaypalAdapter implements PaymentGateway {

  constructor(private paypal:Paypal){}

  pay(amount:number){
    this.paypal.sendPayment(amount)
  }

}
```

---

## Razorpay Adapter

```ts
export class RazorpayAdapter implements PaymentGateway {

  constructor(private razorpay:Razorpay){}

  pay(amount:number){
    this.razorpay.createOrder(amount)
  }

}
```

Adapters unify all providers under the **same interface**.

---

# 4 Payment Registry

Registry stores available gateways and resolves them dynamically.

```ts
export class PaymentRegistry {

  private static gateways =
  new Map<string, () => PaymentGateway>()

  static register(
    name:string,
    factory:() => PaymentGateway
  ){
    this.gateways.set(name,factory)
  }

  static resolve(name:string):PaymentGateway{

    const factory = this.gateways.get(name)

    if(!factory){
      throw new Error("Gateway not found")
    }

    return factory()

  }

}
```

---

# 5 Application Bootstrap

Gateways are registered during application startup.

```ts
PaymentRegistry.register(
  "stripe",
  () => new StripeAdapter(new Stripe())
)

PaymentRegistry.register(
  "paypal",
  () => new PaypalAdapter(new Paypal())
)

PaymentRegistry.register(
  "razorpay",
  () => new RazorpayAdapter(new Razorpay())
)
```

This is called the **Composition Root**.

---

# 6 Checkout Service

Business logic only depends on the strategy interface.

```ts
export class CheckoutService {

  processPayment(
    gatewayType:string,
    amount:number
  ){

    const gateway =
    PaymentRegistry.resolve(gatewayType)

    gateway.pay(amount)

  }

}
```

Checkout service does **not know anything about Stripe or Paypal**.

---

# Example Usage

```ts
const checkout = new CheckoutService()

checkout.processPayment("stripe",500)
checkout.processPayment("paypal",700)
checkout.processPayment("razorpay",1000)
```

Output

```
Stripe payment: 500
Paypal payment: 700
Razorpay order: 1000
```

---

# SOLID Principles Applied

## Single Responsibility Principle

Each class has a single responsibility.

```
Adapter → translate APIs
Registry → resolve gateway
CheckoutService → business logic
```

---

## Open / Closed Principle

The system is **open for extension but closed for modification**.

To add a new gateway:

1 Create adapter  
2 Register in registry  

No existing code must change.

---

## Dependency Inversion Principle

High-level modules depend on abstractions.

```
CheckoutService → PaymentGateway interface
```

Not on concrete implementations.

---

# Adding a New Gateway Example

Example: **Bkash**

SDK

```ts
class Bkash {

  payNow(amount:number){
    console.log("Bkash payment:", amount)
  }

}
```

Adapter

```ts
class BkashAdapter implements PaymentGateway {

  constructor(private bkash:Bkash){}

  pay(amount:number){
    this.bkash.payNow(amount)
  }

}
```

Register it

```ts
PaymentRegistry.register(
  "bkash",
  () => new BkashAdapter(new Bkash())
)
```

Checkout service remains unchanged.

---

# Why This Architecture Is Used in Production

This structure provides:

- Loose coupling
- Provider independence
- High scalability
- Clean architecture boundaries
- Easy extensibility

---

# Real World Use Cases

This pattern combination is commonly used in:

```
Payment systems
Cloud storage providers
Email provider integrations
Messaging systems
Third-party SDK integrations
```

---

# Summary

This system demonstrates:

- Adapter Pattern for API translation
- Strategy Pattern for interchangeable payment behavior
- Registry Pattern for dynamic provider resolution

Architecture Flow

```
CheckoutService
       ↓
PaymentRegistry
       ↓
PaymentGateway (Strategy)
       ↓
Adapter
       ↓
Third-party SDK
```

This architecture ensures a **scalable and maintainable payment integration system**.