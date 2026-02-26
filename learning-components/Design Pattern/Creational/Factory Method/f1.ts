// src/
//  ├── core/
//  ├── services/
//  │     ├── notification/
//  │     │     ├── contracts/
//  │     │     │     ├── Notification.ts
//  │     │     │     ├── NotificationFactory.ts
//  │     │     ├── implementations/
//  │     │     │     ├── EmailNotification.ts
//  │     │     │     ├── SMSNotification.ts
//  │     │     ├── factories/
//  │     │     │     ├── EmailFactory.ts
//  │     │     │     ├── SMSFactory.ts
//  │     │     ├── NotificationRegistry.ts
//  │     │     ├── types.ts
import SESEmailservice, { SESEmailService } from "../../../../src/services/SESEmailService";


//-------------------------contracts/Notification.ts-----------------------
//(define data : dta -> data transfer object)
export interface NotificationPayload {
    recipient: string;
    message: string;
    metadata?: Record<string, any>;
}
//action interface
export interface Notification {
    send(payload: NotificationPayload): Promise<void>;
}


// --------implementations/EmailNotification.ts----------
export class EmailNotification implements Notification {
    constructor(private readonly emailService: SESEmailservice) { }

    async send(payload: NotificationPayload): Promise<void> {
        await this.emailService.sendEmail({
            to: payload.recipient,
            subject: "Email Notification",
            text: payload.message
        })
    }
}

//---------implementations/SMSNotification.ts----------
export class SMSNotification implements Notification {
    async send(payload: NotificationPayload): Promise<void> {
        console.log(`Sending SMS to ${payload.recipient}`);
        console.log(`Message: ${payload.message}`);
    }
}

//---------contracts/NotificationFactory.ts----------
export abstract class NotificationFactory {
    abstract create(): Notification;
}


//---------factories/EmailFactory.ts----------
export class EmailFactory extends NotificationFactory {
    constructor(private readonly emailService: SESEmailservice) {
        super();
    }

    create(): Notification {
        return new EmailNotification(this.emailService);
    }
}

//---------factories/SMSFactory.ts----------
export class SMSFactory extends NotificationFactory {
    create(): Notification {
        return new SMSNotification();
    }
}


//---------NotificationRegistry.ts----------
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

//---------Bootstrap------------
const emailService = new SESEmailService();
NotificationRegistry.register('email', new EmailFactory(emailService));
NotificationRegistry.register('sms', new SMSFactory());


//------------Usage (Auth service)--------------
type notificationChannel = "email" | "sms";

const sendNotification = async (user: any, message: string) => {
    const factory = NotificationRegistry.resolve(user.notificationChannel as notificationChannel)

    const notification = factory.create();

    await notification.send({
        recipient: user.email,
        message
    });
}

