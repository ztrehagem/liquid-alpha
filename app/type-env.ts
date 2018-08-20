import { Type } from './type';

export default class TypeEnv {
  label: string;
  type: Type;

  constructor(label: string, type: Type) {
    this.label = label;
    this.type = type;
  }
}
