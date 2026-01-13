console.clear();

function CapitalizeParams(target: any, propertyKey: string) {
    let value = target[propertyKey];

    const originalDescripror = Object.getOwnPropertyDescriptor(target, propertyKey);
    const originalGetter = originalDescripror?.get;
    const originalSetter = originalDescripror?.set;

    const getter = () => {
        return originalGetter ? originalGetter.call(target) : value;
    }

    const setter = (newValue: string) => {
        const upperCaseValue = newValue.toUpperCase();
        value = originalSetter ? originalSetter.call(target, upperCaseValue) : upperCaseValue ;
    }

    Object.defineProperty(target, propertyKey, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
    });

}

function LogUpdate(target: any, propertyKey: string) {
    let value = target[propertyKey];

    const originalDescripror = Object.getOwnPropertyDescriptor(target, propertyKey);
    const originalGetter = originalDescripror?.get;
    const originalSetter = originalDescripror?.set;

    const getter = () => {
        return originalGetter ? originalGetter.call(target) : value;
    }

    const setter = (newValue: string) => {
        console.log(`Setting ${propertyKey} from ${value} to ${newValue}`);
        value = newValue;
        if(originalSetter){
            originalSetter.call(target, newValue);
        }
    }

    Object.defineProperty(target, propertyKey, { 
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
    });

}

class Person {
    // parameter decorator works on this class parameters
    @LogUpdate        
    @CapitalizeParams // this gets executed first order is down to up -> its effect is getting nullified becuse for one property we have defined property at 2 place
    private _name: string;

    constructor(name: string) {
        this._name = name;
    };

    getName() {
        return this._name;
    };

    setName(name: string) {
        this._name = name;
    };

}

const person = new Person('Prince');
console.log(person.getName());
person.setName("King");
console.log(person.getName());
person.setName("Hello");
console.log(person.getName());