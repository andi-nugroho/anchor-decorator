# TypeScript Decorator Examples

This repository provides a collection of examples demonstrating how to use various types of decorators in TypeScript. Decorators are a special kind of declaration that can be attached to a class declaration, method, accessor, property, or parameter. Decorators use the form `@expression`, where `expression` must evaluate to a function that will be called at runtime with information about the decorated declaration.

## Features

This project includes examples of the following decorators:

- **Class Decorators:**
  - `Timestamp`: Adds a timestamp to a class, logging when an object is created.
  - `Singleton`: Ensures that a class has only one instance.
  - `LimitInstances`: Restricts the number of instances that can be created from a class.
- **Method Decorators:**
  - `LogMethod`: Logs the arguments and return value of a method call.
  - `Memoize`: Caches the result of a method call to improve performance by avoiding repeated computations for the same inputs.
- **Property Decorators:**
  - `CapitalizeParams`: Automatically converts the value of a property to uppercase.
  - `LogUpdate`: Logs changes to a property's value.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (which includes npm)
- [TypeScript](https://www.typescriptlang.org/)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/prince981620/decorator.git
   cd decorator
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Usage

To compile the TypeScript code, run the following command:

```bash
npm run compile
```

This will compile the `.ts` files from the `src` directory and output the compiled JavaScript files to the `dist` directory, as configured in `tsconfig.json`.

To run the examples, you can execute the compiled JavaScript files using Node.js. For example, to run the class decorator examples:

```bash
node dist/decorators/classDecorator.js
```

## Decorators Explained

### Class Decorators

Class decorators are applied to the constructor of a class and can be used to observe, modify, or replace a class definition.

#### `Timestamp`
This decorator logs the creation time of an object. It's implemented as a decorator factory, which allows it to be configured.

```typescript
// src/decorators/classDecorator.ts

function Timestap(allow: boolean) {
    return function<T extends { new (...args: any[]): {} }>(ClassEntity: T):T {
        class newClass extends ClassEntity {
            constructor(...args: any[]) {
                super(...args);
                if (allow) {
                    console.log("Object created at", new Date().toDateString());
                }
            };
        };

        return newClass;
    }
}

@Timestap(true)
class MyClass {}

const myInstance = new MyClass(); // Logs "Object created at ..."
```

#### `Singleton`
This decorator ensures that only one instance of a class can be created.

```typescript
// src/decorators/classDecorator.ts

function Singleton<T extends { new (...args: any[]): {} }>(ClassEntity: T):T {
    let instance: InstanceType<T>;

    class newClass extends ClassEntity {
        constructor(...args: any[]) {
            if(!instance){
                instance = super(...args) as InstanceType<T>;
            }
            return instance;
        };
    };

    return newClass;
}

@Singleton
class DatabaseConnection {}

const conn1 = new DatabaseConnection();
const conn2 = new DatabaseConnection();
console.log(conn1 === conn2); // true
```

### Method Decorators

Method decorators are applied to the property descriptor for a method and can be used to observe, modify, or replace a method definition.

#### `Memoize`
This decorator caches the results of a function call and returns the cached result when the same inputs occur again.

```typescript
// src/decorators/methodDecorator.ts

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

class MathUtil {
    @Memoize
    static add(a: number, b: number) {
        console.log("Performing addition");
        return a + b;
    }
}

MathUtil.add(2, 3); // "Performing addition", returns 5
MathUtil.add(2, 3); // "Returning from cache", returns 5
```

### Property Decorators

Property decorators are applied to a property of a class.

#### `CapitalizeParams` and `LogUpdate`
`CapitalizeParams` transforms the property's value to uppercase, and `LogUpdate` logs any changes to the property.

```typescript
// src/decorators/paramDecorator.ts

function CapitalizeParams(target: any, propertyKey: string) {
    // ... implementation ...
}

function LogUpdate(target: any, propertyKey: string) {
    // ... implementation ...
}

class Person {
    @LogUpdate
    @CapitalizeParams
    private _name: string;

    constructor(name: string) {
        this._name = name;
    }

    // ... getters and setters ...
}

const person = new Person("john");
console.log(person.getName()); // JOHN
person.setName("jane"); // "Setting _name from JOHN to JANE"
console.log(person.getName()); // JANE
```

## License

This project is licensed under the ISC License. See the `LICENSE` file for details.
