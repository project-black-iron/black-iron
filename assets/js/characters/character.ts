import { AbstractEntity, IEntity } from "../entity";

export interface ICharacter extends IEntity {
  name: string;
  portrait: string;
}

export class Character extends AbstractEntity implements ICharacter {
  name: string;
  portrait: string;

  constructor(data: ICharacter) {
    super(data);
    this.name = data.name;
    this.portrait = data.portrait;
  }
}
