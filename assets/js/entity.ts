export interface EntitySchema {
  _abstract: {
    key: string;
    value: IEntity;
  };
}

export interface IEntity {
  pid: string;
  rev?: string;
  revisions?: string[];
  conflict?: IEntity;
  deleted_at?: string;
  data: unknown;
}

export class AbstractEntity implements IEntity {
  get baseRoute() {
    return "/";
  }
  get route() {
    return "/_abstract";
  }

  pid: string;
  rev?: string;
  revisions?: string[];
  conflict?: IEntity;
  deleted_at?: string;
  data: unknown;

  constructor(data: IEntity) {
    this.pid = data.pid;
    this.rev = data.rev;
    this.revisions = data.revisions;
    this.conflict = data.conflict;
    this.deleted_at = data.deleted_at;
    this.data = data.data;
  }

  eq(other: IEntity): boolean {
    return this.pid === other.pid && this.deleted_at == other.deleted_at;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  merge(other: IEntity): AbstractEntity {
    throw new Error("Not implemented");
  }

  toEntity(): IEntity {
    const entity: IEntity = { pid: this.pid, data: structuredClone(this.data) };
    if (this.rev) {
      entity.rev = this.rev;
    }
    if (this.revisions) {
      entity.revisions = this.revisions;
    }
    return entity;
  }
}

/**
 * Error thrown when a entity conflict is detected. This can happen in two
 * scenarios: when a merge fails (which is typically handled transparently in
 * he background), or when a remote entity is fetched that has a
 * `ConstraintError`, likely on a unique key, with an existing local entity,
 * possibly on a different ID.
 */
export class EntityConflictError extends Error {
  constructor() {
    super("Entity conflict detected");
  }
}
