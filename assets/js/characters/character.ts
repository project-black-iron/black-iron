import { AbstractSyncable, ISyncable } from "../sync";

export interface ICharacter extends ISyncable {
  name: string;
  portrait: string;
}

export class Character extends AbstractSyncable implements ICharacter {
  name: string;
  portrait: string;

  constructor(data: ICharacter) {
    super(data);
    this.name = data.name;
    this.portrait = data.portrait;
  }
}
