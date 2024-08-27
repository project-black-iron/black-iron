import { AbstractSyncable, ISyncable } from "../sync";

export interface ICharacter extends ISyncable {
  name: string;
}

export class Character extends AbstractSyncable implements ICharacter {
  name: string;

  constructor(data: ICharacter) {
    super(data);
    this.name = data.name;
  }
}
