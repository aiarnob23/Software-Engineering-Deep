# Notification System

## Factory Method + Registry Pattern Architecture

---

## Introduction

This notification system is implemented using the **Factory Method Design Pattern** combined with a lightweight **Registry pattern**.

The goal of this architecture is to:

- Decouple business logic from concrete implementations  
- Dynamically resolve notification channels  
- Follow Open/Closed Principle  
- Support provider switching without refactoring  
- Maintain clean separation of concerns  

This structure is designed for scalable, production-ready backend systems.

---

## Problem Statement

A naive implementation might look like this:

```ts
new EmailNotification(new SESEmailService());
```

This approach creates tight coupling between business logic and infrastructure.

If we later:

- Replace SES with another provider (e.g., SendGrid)
- Add a new notification channel (e.g., WhatsApp)
- Modify delivery logic

We would need to modify existing business code.

This violates:

- Open/Closed Principle
- Dependency Inversion Principle
- Separation of Concerns

To solve this, we use the Factory Method pattern with registry-based resolution.

---

## Architecture Flow

```
Auth Service
    ↓
NotificationRegistry
    ↓
Concrete Factory (EmailFactory / SMSFactory)
    ↓
Concrete Notification (EmailNotification / SMSNotification)
    ↓
External Service (SESEmailService, etc.)
```

Each layer has a clear responsibility.

---

## Core Components

### 1. Notification Contract

Defines a common interface for all notification types.

```ts
export interface NotificationPayload {
  recipient: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  send(payload: NotificationPayload): Promise<void>;
}
```

---

### 2. Factory Method

Defines the object creation contract.

```ts
export abstract class NotificationFactory {
  abstract create(): Notification;
}
```

Concrete factories override this method to create specific notification implementations.

---

### 3. Concrete Notification Example

```ts
export class EmailNotification implements Notification {
  constructor(private readonly emailService: SESEmailService) {}

  async send(payload: NotificationPayload): Promise<void> {
    await this.emailService.sendEmail({
      to: payload.recipient,
      subject: "Email Notification",
      text: payload.message,
    });
  }
}
```

Each notification class handles only its own delivery logic.

---

### 4. Concrete Factory Example

```ts
export class EmailFactory extends NotificationFactory {
  constructor(private readonly emailService: SESEmailService) {
    super();
  }

  create(): Notification {
    return new EmailNotification(this.emailService);
  }
}
```

The factory encapsulates object creation logic.

---

### 5. Notification Registry

Responsible for resolving the correct factory dynamically.

```ts
export class NotificationRegistry {
  private static factories = new Map<string, NotificationFactory>();

  static register(type: string, factory: NotificationFactory) {
    this.factories.set(type, factory);
  }

  static resolve(type: string): NotificationFactory {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`No factory found for type ${type}`);
    }
    return factory;
  }
}
```

---

## Bootstrap (Composition Root)

All dependencies are wired during application startup.

```ts
const emailService = new SESEmailService();

NotificationRegistry.register("email", new EmailFactory(emailService));
NotificationRegistry.register("sms", new SMSFactory());
```

Object creation and dependency wiring happen only here.

---

## Usage Example (Auth Service)

```ts
type NotificationChannel = "email" | "sms";

const sendNotification = async (user: any, message: string) => {
  const factory = NotificationRegistry.resolve(
    user.notificationChannel as NotificationChannel
  );

  const notification = factory.create();

  await notification.send({
    recipient: user.email,
    message,
  });
};
```

AuthService:

- Does not know concrete classes  
- Does not instantiate implementations directly  
- Only resolves by channel type  

---

## Adding a New Channel (Example: WhatsApp)

To add WhatsApp:

1. Create `WhatsAppNotification`
2. Create `WhatsAppFactory`
3. Register it in bootstrap

No changes required in:

- AuthService  
- NotificationRegistry  
- Existing factories  

This follows Open/Closed Principle.

---

## Switching Email Provider

To replace SES with another provider:

```ts
const emailService = new SendGridService();
NotificationRegistry.register("email", new EmailFactory(emailService));
```

Only bootstrap wiring changes.  
All business logic remains untouched.

---

## Design Principles Applied

- Factory Method Pattern
- Open/Closed Principle
- Dependency Inversion Principle
- Single Responsibility Principle
- Separation of Concerns

---

## Real-World Use Cases

This pattern is commonly used in:

- Payment gateway integrations (Stripe / PayPal / Razorpay)
- Storage providers (S3 / Cloudinary / Local storage)
- Database connectors
- Logging providers
- Multi-channel communication systems

---

## Summary

This implementation demonstrates:

- Delegated object creation via Factory Method  
- Dynamic resolution using a registry  
- Clean separation between business and infrastructure  
- Scalable and provider-independent architecture  

The system is modular, extensible, and production-ready.