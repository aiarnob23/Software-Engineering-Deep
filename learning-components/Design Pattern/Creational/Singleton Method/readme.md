# Logger System

## Singleton Pattern Architecture

---

## Introduction

This logger system is implemented using the **Singleton Design Pattern**.

The purpose of this architecture is to:

- Ensure only **one logger instance exists**
- Provide a **global logging access point**
- Prevent unnecessary object creation
- Maintain centralized logging behavior

This structure is commonly used in **backend systems** where logging must remain consistent across the entire application.

---

# Problem Statement

A naive logger implementation might look like this:

```ts
const logger1 = new Logger();
const logger2 = new Logger();
```

This creates **multiple logger instances**, which can lead to:

- inconsistent logging behavior
- memory overhead
- duplicated configurations

In large backend systems (Node.js / Bun / Express / NestJS), we usually want **a single logging instance shared across the entire application**.

To solve this, we use the **Singleton Pattern**.

---

# Logger Implementation

```ts
export default class Logger {
    private static instance: Logger;

    private constructor() {
        console.log("Logger instance created");
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    log(message: string) {
        console.log(`[LOG]: ${message}`);
    }
}
```

---

# Architecture Flow

```
Application
     ↓
Logger.getInstance()
     ↓
Singleton Logger Instance
     ↓
log()
     ↓
Console Output
```

---

# Core Concepts Explained

---

## 1. `private static instance`

```ts
private static instance: Logger;
```

This property stores the **single logger instance**.

### Why `static`?

`static` means the property belongs to the **class itself**, not to an object.

Without `static`, every object would have its own instance.

Example:

```
Logger.instance
```

Instead of:

```
logger.instance
```

This allows the class to manage the single instance globally.

---

## 2. `private constructor`

```ts
private constructor() {
    console.log("Logger instance created");
}
```

### Why `private`?

If the constructor was public:

```ts
new Logger()
```

Anyone could create unlimited logger objects.

By making the constructor **private**, we ensure:

- No external code can create a Logger directly
- The class itself controls object creation

This is the **core rule of Singleton**.

---

## 3. `getInstance()` Method

```ts
public static getInstance(): Logger
```

This method provides the **single access point** to retrieve the logger instance.

### Why `static`?

Because we call it on the class:

```ts
Logger.getInstance()
```

Not on an object.

If it wasn't static:

```
const logger = new Logger()
logger.getInstance()
```

But the constructor is private, so that would be impossible.

---

## 4. Lazy Initialization

Inside `getInstance()`:

```ts
if (!Logger.instance) {
    Logger.instance = new Logger();
}
```

This means:

- If instance does not exist → create it
- Otherwise → return the existing instance

This technique is called **Lazy Initialization**.

The object is created **only when needed**.

---

## 5. Why `log()` is NOT static

```ts
log(message: string)
```

This is an **instance method**.

Meaning it must be called on the logger object.

Example:

```ts
const logger = Logger.getInstance();
logger.log("Server started");
```

### Why not static?

If we made it static:

```ts
static log(message: string)
```

Then we could call:

```ts
Logger.log("Hello")
```

But then **Singleton becomes useless**, because we would never use the instance.

---

# Usage Example

```ts
import Logger from "./Logger";

const logger = Logger.getInstance();

logger.log("Server started");
logger.log("Database connected");
```

Output:

```
Logger instance created
[LOG]: Server started
[LOG]: Database connected
```

Important:

The constructor runs **only once**.

---

# Application-Wide Logger

Usually we export the logger instance:

```ts
export const logger = Logger.getInstance();
```

Then use it anywhere:

```ts
import { logger } from "./logger";

logger.log("User created");
```

This avoids repeatedly calling `getInstance()`.

---

# Design Principles Applied

### Singleton Pattern

Ensures a **single shared instance**.

### Encapsulation

The constructor is private, so object creation is controlled.

### Global Access Point

`getInstance()` provides a centralized logger.

### Memory Efficiency

Prevents unnecessary object creation.

---

# Real World Use Cases

Singleton is commonly used for:

- Logging systems
- Database connections
- Configuration managers
- Cache managers
- Event buses

Example:

```
DatabaseConnection
Logger
ConfigManager
```

These components typically require **only one instance**.

---

# Common Mistakes

### ❌ Making log() static

```ts
static log()
```

This removes the purpose of Singleton.

---

### ❌ Public constructor

```ts
constructor()
```

This allows unlimited instances.

---

### ❌ Not using static instance

Without `static`, each object would have its own instance.

---

# Summary

This Logger implementation demonstrates:

- Singleton Pattern
- Controlled object creation
- Global access through static method
- Consistent logging interface

The system ensures:

- Only **one logger instance**
- Centralized logging behavior
- Scalable backend architecture

This pattern is widely used in **Node.js, Bun, Express, and enterprise backend systems**.