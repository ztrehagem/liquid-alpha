import * as wrd from './word';


export class Type {
  str: string;

  constructor(str: string = null) {
    this.str = str;
  }

  equalTo(type: Type) {
    return type.str === this.str;
  }

  toString() {
    return this.str;
  }
}

export class PairType extends Type {
  car: Type;
  cdr: Type;

  constructor(car: Type, cdr: Type) {
    super();
    this.car = car;
    this.cdr = cdr;
  }

  equalTo(type: Type): boolean {
    return (type instanceof PairType) && type.car.equalTo(this.car) && type.cdr.equalTo(this.cdr);
  }

  toString() {
    return `(${this.car}, ${this.cdr})`;
  }
}

export class FunType extends Type {
  def: Type;
  dom: Type;

  constructor(def: Type, dom: Type) {
    super();
    this.def = def;
    this.dom = dom;
  }

  equalTo(type: Type): boolean {
    return (type instanceof FunType) && type.def.equalTo(this.def) && type.dom.equalTo(this.dom);
  }

  get arrowStr() {
    return '->';
  }

  toString() {
    const defStr: string = this.def instanceof FunType ? `(${this.def})` : this.def.toString();
    return `${defStr} ${this.arrowStr} ${this.dom}`;
  }
}

export class AsyncFunType extends FunType {
  equalTo(type: Type): boolean {
    return (type instanceof AsyncFunType) && super.equalTo(type);
  }

  get arrowStr() {
    return '->a';
  }
}

export const BOOL = new Type(wrd.BOOL);
export const NUMBER = new Type(wrd.NUMBER);

