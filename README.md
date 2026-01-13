# Anchor & Decorator Projects

**Repository:** [https://github.com/andi-nugroho/anchor-decorator](https://github.com/andi-nugroho/anchor-decorator)

This mono-repository contains two distinct projects exploring different technologies:
1.  **amm-anchor**: A Rust-based project utilizing the Anchor framework (likely for Solana DeFi).
2.  **decorator**: A comprehensive collection of TypeScript Decorator patterns and examples.

---

## Table of Contents
1. [Project 1: AMM Anchor (Rust)](#project-1-amm-anchor-rust)
2. [Project 2: TypeScript Decorators](#project-2-typescript-decorators)
3. [License](#license)

---

## Project 1: AMM Anchor (Rust)

**Directory:** `/amm-anchor`

This project is currently in its early stages. It is written in Rust and suggests an implementation related to Automated Market Makers (AMMs) using the Anchor framework, commonly used for Solana smart contract development.

### Features
* Written in **Rust**.
* Intended for development in the **Decentralized Finance (DeFi)** space.
* Utilizes the **Anchor Framework** for blockchain development.

### Getting Started

#### Prerequisites
* [Rust](https://www.rust-lang.org/tools/install) installed.
* [Anchor CLI](https://github.com/project-serum/anchor) (if interacting with Solana).

#### Installation & Usage

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/andi-nugroho/anchor-decorator.git](https://github.com/andi-nugroho/anchor-decorator.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd amm-anchor
    ```

3.  **Build the project:**
    ```bash
    cargo build
    ```

4.  **Run tests:**
    ```bash
    cargo test
    ```

---

## Project 2: TypeScript Decorators

**Directory:** `/decorator`

This project provides a collection of examples demonstrating how to use various types of decorators in TypeScript. Decorators are a special kind of declaration that can be attached to a class declaration, method, accessor, property, or parameter.

### Features implemented
* **Class Decorators:**
    * `@Timestamp`: Adds a timestamp logging when an object is created.
    * `@Singleton`: Ensures that a class has only one instance.
    * `@LimitInstances`: Restricts the number of instances executable from a class.
* **Method Decorators:**
    * `@LogMethod`: Logs arguments and return values of method calls.
    * `@Memoize`: Caches results of method calls to improve performance.
* **Property Decorators:**
    * `@CapitalizeParams`: Automatically converts property values to uppercase.
    * `@LogUpdate`: Logs changes to a property's value.

### Getting Started

#### Prerequisites
* [Node.js](https://nodejs.org/en/) (includes npm).
* [TypeScript](https://www.typescriptlang.org/).

#### Installation & Usage

1.  **Navigate to the directory:**
    ```bash
    cd decorator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Compile the code:**
    ```bash
    npm run compile
    ```
    *This compiles `.ts` files from `src` to `dist`.*

4.  **Run an example:**
    ```bash
    node dist/decorators/classDecorator.js
    ```

### Code Examples

#### Class Decorator: `@Timestamp` & `@Singleton`
```typescript
// Example: Adding timestamp logging on creation
function Timestamp(allow: boolean) {
    return function<T extends { new (...args: any[]): {} }>(ClassEntity: T): T {
        return class extends ClassEntity {
            constructor(...args: any[]) {
                super(...args);
                if (allow) console.log("Object created at", new Date().toDateString());
            }
        };
    }
}

// Example: Ensuring only one instance exists
function Singleton<T extends { new (...args: any[]): {} }>(ClassEntity: T): T {
    let instance: InstanceType<T>;
    return class extends ClassEntity {
        constructor(...args: any[]) {
            if (!instance) {
                instance = super(...args) as InstanceType<T>;
            }
            return instance;
        }
    };
}
```

### Method Decorator: @Memoize

```typescript
// Example: Caching results to avoid repeated computations
function Memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalFun = descriptor.value;
    const cache = new Map<string, any>();

    descriptor.value = function (...args: any[]) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            console.log("Returning from cache");
            return cache.get(key);
        }
        const result = originalFun.apply(this, args);
        cache.set(key, result);
        return result;
    }
    return descriptor;
}
```

### License
This repository is licensed under the ISC License.
