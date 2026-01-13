console.clear();

// a method decorator takes three arguments
// this basically modifies the defnition of the functions
function LogMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalFun = descriptor.value;
    descriptor.value = function (...args: any[]) {
        console.log(`Calling ${propertyKey} with arguements`, args)
        const result = originalFun.apply(this, args);
        console.log(result);
        return result;
    }
    return descriptor;
}

// a docorator that store the value of calculation and returns the cache value as long as the params remains the same
function Memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalFun = descriptor.value;
    const cache = new Map<string, any>(); // will store the parameters and their result
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




export class Math {
    // @LogMethod
    @Memoize
    static add(a: number, b:number){
        console.log("Original Methode")
        return a + b;
    }
    
    static mul(a: number, b:number){
        return a * b;
    }
}

const result1 = Math.add(1,2);
const result2 = Math.add(1,2);
const result3 = Math.add(1,2);
const result4 = Math.add(1,2);
const result5 = Math.add(1,2);