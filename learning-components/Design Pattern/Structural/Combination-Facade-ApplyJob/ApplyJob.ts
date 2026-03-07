//strategy interface <-- Strategy Pattern
export interface PaymentStrategy {
    pay(amount: number): Promise<void>;
}

// Concrete Strategy   <-- Strategy Pattern
export class StripePayment implements PaymentStrategy {
    async pay(amount: number) {
        console.log("Stripe payment:", amount);
    }
}
export class PaypalPayment implements PaymentStrategy {
    async pay(amount: number) {
        console.log("Paypal payment:", amount);
    }
}

// Repository Interface  <-- Repository Pattern
export interface JobApplicationRepository {
    save(data: any): Promise<void>;
}
// Concrete Repository  <-- Repository Pattern
export class MongoJobApplicationRepository implements JobApplicationRepository {
    async save(data: any): Promise<void> {
        console.log("Saving job application to MongoDB:", data);
    }
}

//External system (S3 etc.)
export class ResumeStorageService {
    async upload(file: string) {
        console.log("Uploading resume to S3:", file);
        return "resume-url";
    }
}
export class EmailService {
    async sendConfirmation(email: string) {
        console.log("Sending confirmation email to:", email);
    }
}

//Application Service (Business Logic)
export class ApplicationService {
  constructor(
    private repo: JobApplicationRepository, // <-- Dependency Injection
    private paymentStrategy: PaymentStrategy // <-- Strategy Pattern
  ) {}

  async apply(data: any) {
    await this.paymentStrategy.pay(10); // <-- Strategy Pattern used
    await this.repo.save(data); // <-- Repository Pattern used
  }
}

//Facade layer 
export class ApplyJobFacade { 
  // <-- Facade Design Pattern (Single entry point)

  constructor(
    private storage: ResumeStorageService,
    private email: EmailService,
    private appService: ApplicationService
  ) {} // <-- Dependency Injection

  async applyJob(data: {
    userId: string;
    jobId: string;
    email: string;
    resume: string;
  }) {

    // Step 1 upload resume
    const resumeUrl = await this.storage.upload(data.resume);

    // Step 2 save application
    await this.appService.apply({
      userId: data.userId,
      jobId: data.jobId,
      resume: resumeUrl
    });

    // Step 3 send confirmation
    await this.email.sendConfirmation(data.email);

    return { success: true };
  }
}

//Controller (client layer)
// Setup dependencies

const payment = new StripePayment(); // <-- Strategy Pattern
const repo = new MongoJobApplicationRepository(); // <-- Repository Pattern

const appService = new ApplicationService(repo, payment); // <-- Dependency Injection

const facade = new ApplyJobFacade(
  new ResumeStorageService(),
  new EmailService(),
  appService
); // <-- Facade Pattern


// Controller
await facade.applyJob({
  userId: "user1",
  jobId: "job1",
  email: "user@mail.com",
  resume: "resume.pdf"
});