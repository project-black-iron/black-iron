
export interface SyncableSchema {
  _abstract: {
    key: string;
    value: ISyncable;
  };
}

export interface ISyncable {
  id: string;
  _rev?: string;
  _revisions?: string[];
  _conflict?: ISyncable;
  deleted_at?: string;
}

export class AbstractSyncable implements ISyncable {
  get route() {
    return "/";
  }

  id: string;
  _rev?: string;
  _revisions?: string[];
  _conflict?: ISyncable;
  deleted_at?: string;

  constructor(data: ISyncable) {
    this.id = data.id;
    this._rev = data._rev;
    this._revisions = data._revisions;
    this._conflict = data._conflict;
    this.deleted_at = data.deleted_at;
  }

  eq(other: ISyncable): boolean {
    return this.id === other.id && this.deleted_at == other.deleted_at;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  merge(other: ISyncable): AbstractSyncable {
    throw new Error("Not implemented");
  }

  toSyncable(): ISyncable {
    const syncable: ISyncable = { id: this.id };
    if (this._rev) {
      syncable._rev = this._rev;
    }
    if (this._revisions) {
      syncable._revisions = this._revisions;
    }
    return syncable;
  }
}

/**
 * Error thrown when a syncable conflict is detected. This can happen in two
 * scenarios: when a merge fails (which is typically handled transparently in
 * he background), or when a remote syncable is fetched that has a
 * `ConstraintError`, likely on a unique key, with an existing local syncable,
 * possibly on a different ID.
 */
export class SyncableConflictError extends Error {
  constructor() {
    super("Syncable conflict detected");
  }
}
