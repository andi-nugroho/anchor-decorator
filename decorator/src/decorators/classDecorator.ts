console.clear();

type GenericBaseClass = new (...args: any[]) => {};

// this a decorator factory

function Timestap(allow: boolean) {
    return function<T extends GenericBaseClass>(ClassEntity: T):T {
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

//  this is a class decorator

// function Timestap<T extends GenericBaseClass>(ClassEntity: T):T {
// // in a decorator fn you should be able to extend the class
// // and make a new object of class 
// // this is how a decorator is diff from normal fn
//     // class newClass extends ClassEntity {}; // error
//     // const entity = new ClassEntity(); // error

//     class newClass extends ClassEntity {
//         constructor(...args: any[]) {
//             super(...args);
//             console.log("Object created at", new Date().toDaTimestapring());
//         };
//     };

//     return newClass;
// }

function Singleton<T extends GenericBaseClass>(ClassEntity: T):T {
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

// create a decorator that allows to create only 5 object of a class

// function LimitInstances<T extends { new (...args: any[]): any }>(BaseClass: T): T {
//   let instanceCount = 0;

//   return class extends BaseClass {
//     constructor(...args: any[]) {
//       instanceCount++;
//       if (instanceCount > 5) {
//         throw new Error("Maximum of 5 instances allowed.");
//       }
//       super(...args);
//       console.log(`Instance #${instanceCount} created`);
//     }
//   };
// }

function LimitInstances(limit: number) {
    return function<T extends { new (...args: any[]): any }>(BaseClass: T): T {
    let instanceCount = 0;

        return class extends BaseClass {
            constructor(...args: any[]) {
            instanceCount++;
            if (instanceCount > limit) {
                throw new Error("Maximum of 5 instances allowed.");
            }
            super(...args);
            console.log(`Instance #${instanceCount} created`);
            }
        };
    }
}

const ENABLE_TIMESTAMP = true;

@Timestap(ENABLE_TIMESTAMP)
@Singleton
class Employee {
    public name: string = '';

    constructor(name: string) {
        this.name = name;
    }
};

@Timestap(ENABLE_TIMESTAMP)
@Singleton
class Student {
    public roll_no: number ;

    constructor(roll_no: number) {
        this.roll_no = roll_no;
    }
};

@LimitInstances(5)
class Warrior {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

const employee1 = new Employee('prince');
console.log(employee1.name);

const employee2 = new Employee('sagar');
console.log(employee2.name);

console.log(employee1 === employee2); // its not a singleton class

const student = new Student(20);
console.log(student.roll_no);


for (let i = 1; i <= 5; i++) {
  try {
    const w = new Warrior(`Warrior${i}`);
    console.log(w.name);
  } catch (err: any) {
    console.error(err.message);
  }
}

// just write @Test on top of class 
// the below happens at run time but @Test implements at compile time
// const AdvanceEmployee = Test(Employee);
// const advEmployee = new AdvanceEmployee('Price');
// console.log(advEmployee.name);
