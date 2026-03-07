# Apply Job System (Design Pattern Based Architecture)

## Overview

This project demonstrates how multiple **software design patterns** can be used together to build a **clean, scalable backend architecture**.

The example simulates a **Job Application system** where a user applies for a job.
Internally, the system performs multiple operations such as:

* Uploading a resume
* Processing payment
* Saving the application
* Sending a confirmation email

Instead of exposing these complexities to the controller, a **Facade Pattern** is used to provide a **single simplified interface**.

---

# Architecture

```
Controller
   │
   ▼
ApplyJobFacade (Facade Pattern)
   │
   ├── ResumeStorageService
   ├── EmailService
   │
   ▼
ApplicationService
   │
   ├── PaymentStrategy (Strategy Pattern)
   │
   ▼
Repository Layer (Repository Pattern)
   │
   ▼
Database
```

---

# Design Patterns Used

## 1. Facade Pattern

### Purpose

The **Facade Pattern** provides a simplified interface to a complex subsystem.

### Where it is used

```
ApplyJobFacade
```

### Responsibility

The facade orchestrates multiple services:

* Resume upload
* Payment processing
* Application saving
* Email notification

Controller only interacts with:

```
facade.applyJob()
```

This hides internal complexity.

---

## 2. Strategy Pattern

### Purpose

The **Strategy Pattern** allows switching algorithms or behaviors at runtime.

### Where it is used

```
PaymentStrategy
StripePayment
PaypalPayment
```

### Example

```
interface PaymentStrategy {
  pay(amount: number): Promise<void>
}
```

Concrete implementations:

```
StripePayment
PaypalPayment
```

This allows the system to switch payment providers without modifying the core logic.

---

## 3. Repository Pattern

### Purpose

The **Repository Pattern** abstracts the data access layer.

Instead of directly interacting with the database, services interact with repositories.

### Where it is used

```
JobApplicationRepository
MongoJobApplicationRepository
```

### Benefit

* Database logic is isolated
* Easy to swap database implementations
* Improves testability

---

## 4. Dependency Injection

### Purpose

Dependencies are injected into classes instead of being created inside them.

### Example

```
new ApplicationService(repo, paymentStrategy)
```

Benefits:

* Loose coupling
* Easy testing
* Better modularity

---

# System Flow

When a user applies for a job:

### Step 1

Controller calls:

```
facade.applyJob()
```

### Step 2

Facade uploads the resume

```
ResumeStorageService.upload()
```

### Step 3

ApplicationService processes the application

```
ApplicationService.apply()
```

### Step 4

Payment is handled via Strategy

```
paymentStrategy.pay()
```

### Step 5

Application is saved via Repository

```
JobApplicationRepository.save()
```

### Step 6

Confirmation email is sent

```
EmailService.sendConfirmation()
```

---

# Why This Architecture Is Useful

This architecture improves:

### Maintainability

Each component has a single responsibility.

### Scalability

New services can be added without changing the controller.

### Flexibility

Payment providers or databases can be replaced easily.

### Testability

Each layer can be tested independently.

---

# Real World Equivalent

This architecture is similar to patterns used in large production systems:

* Amazon order processing systems
* Stripe payment orchestration
* Uber service orchestration
* Microservice gateway layers

---

# Example Usage

Controller example:

```
await facade.applyJob({
  userId: "user1",
  jobId: "job1",
  email: "user@mail.com",
  resume: "resume.pdf"
})
```

The controller does not need to know:

* how resumes are uploaded
* how payments are processed
* how applications are stored
* how emails are sent

All complexity is hidden behind the **Facade**.

---

# Key Takeaways

This project demonstrates how combining multiple design patterns leads to a **clean and production-ready architecture**.

Patterns used:

* Facade Pattern
* Strategy Pattern
* Repository Pattern
* Dependency Injection

Together they create a system that is:

* modular
* maintainable
* scalable
* testable
