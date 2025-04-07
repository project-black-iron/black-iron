import { IDBPDatabase, StoreNames } from "idb";
import { PropertyDeclaration } from "lit";
import * as v from "valibot";

import { BlackIronDBSchema } from "./db";
import { objectToFormData } from "./utils/form-data";

export interface EntitySchema {
  _abstract: {
    key: string;
    value: IEntity<unknown>;
  };
}

interface IBaseEntity<T> {
  pid: string;
  rev?: string;
  revisions?: string[];
  deleted_at?: string | null;
  data: T;
}

export interface IEntity<T> extends IBaseEntity<T> {
  conflict?: IBaseEntity<T> | null;
}

const baseEntityProps = {
  pid: v.string(),
  rev: v.optional(v.string()),
  revisions: v.optional(v.array(v.string())),
  deleted_at: v.optional(v.nullish(v.string())),
  data: v.any(),
};
const baseEntityFields = Object.keys(baseEntityProps);
const baseEntitySchema = v.object(baseEntityProps);

export type ITSchema<T> =
  & v.BaseSchema<unknown, T, v.BaseIssue<unknown>>
  & v.ObjectSchema<v.ObjectEntries, v.ErrorMessage<v.ObjectIssue> | undefined>;

const entitySchema = v.object({
  ...baseEntitySchema.entries,
  ...v.object({
    conflict: v.optional(v.nullish(baseEntitySchema)),
  }).entries,
});

export interface IEntityStatics<T> {
  readonly storeName: StoreNames<BlackIronDBSchema>;
  readonly schema: ITSchema<IEntity<T>>;
  readonly dataSchema: ITSchema<T>;
  dbUpgrade(db: IDBPDatabase<BlackIronDBSchema>): void;
  arrayPropOpts(name: string): PropertyDeclaration;
  propOpts(name: string): PropertyDeclaration;
  convertArray(data: string | null): IEntity<T>[] | undefined;
  convert(data: string | null): IEntity<T> | undefined;
  parse(data: string | Record<string, unknown>): IEntity<T>;
}

export interface IEntityInstance<T> extends IEntity<T> {
  readonly baseRoute: string;
  readonly route: string;
  eq(other: IEntity<T>): boolean;
  merge(other: IEntity<T>): this;
  toRaw(): IEntity<T>;
  toFormData(): FormData;
}

function makeSchema<T>(dataSchema: ITSchema<T>): ITSchema<IEntity<T>> {
  return v.object({
    ...entitySchema.entries,
    ...v.object({
      data: dataSchema,
    }).entries,
  });
}

export function entity<T>(
  storeName: StoreNames<BlackIronDBSchema>,
  dataSchema: ITSchema<T>,
) {
  abstract class DerivedEntity<TData> extends AbstractEntity<TData> {
    static readonly storeName = storeName;
    static readonly dataSchema = dataSchema;
    static readonly schema = makeSchema(dataSchema);

    static dbUpgrade(db: IDBPDatabase<BlackIronDBSchema>): void {
      db.createObjectStore(this.storeName, {
        keyPath: "pid",
      });
    }

    static propOpts(name: string): PropertyDeclaration {
      return this.propertyOpts(name, false)
    }
    
    static arrayPropOpts(name: string): PropertyDeclaration {
      return this.propertyOpts(name, true)
    }
      
    private static propertyOpts(name: string, isArray?: boolean): PropertyDeclaration {
      return {
        attribute: name,
        converter: isArray
          ? this.convertArray.bind(this)
          : this.convert.bind(this),
        hasChanged: isArray ? hasEntityArrayChanged : hasEntityChanged,
      };
    }

    static convertArray(data: string | null): IEntity<T>[] | undefined {
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map((p) => this.parse(p));
        }
      }
    }

    static convert(data: string | null): IEntity<T> | undefined {
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed) {
          return this.parse(parsed);
        }
      }
    }

    static parse(data: Record<string, unknown>): IEntity<T> {
      try {
        return v.parse(this.schema, data);
      } catch (e) {
        if (v.isValiError(e)) {
          throw new DataValidationError(e);
        }
        throw e;
      }
    }
  }
  
  return DerivedEntity<T>;
}

abstract class AbstractEntity<T> implements IEntityInstance<T> {
  abstract baseRoute: string;
  abstract route: string;
  abstract merge(other: IEntity<T>): this;

  pid: string;
  rev?: string;
  revisions?: string[];
  conflict?: IBaseEntity<T> | null;
  deleted_at?: string | null;
  data: T;

  constructor(data: IEntity<T>) {
    this.pid = data.pid;
    this.rev = data.rev;
    this.revisions = data.revisions;
    this.conflict = data.conflict;
    this.deleted_at = data.deleted_at;
    this.data = data.data;
  }

  bumpRev() {
    this.rev = crypto.randomUUID();
    this.revisions = this.revisions ?? [];
    this.revisions.unshift(this.rev);
  }

  eq(other: IEntity<T>): boolean {
    return this.pid === other.pid && this.deleted_at == other.deleted_at;
  }

  toRaw(): IEntity<T> {
    const entity: IEntity<T> = {
      pid: this.pid,
      data: structuredClone(this.data),
    };
    if (this.rev) {
      entity.rev = this.rev;
    }
    if (this.revisions) {
      entity.revisions = this.revisions;
    }
    return entity;
  }

  toFormData(): FormData {
    return objectToFormData(this, baseEntityFields);
  }
}

export function hasEntityChanged<T>(
  newVal: IEntity<T> | undefined,
  oldVal: IEntity<T> | undefined,
) {
  if (newVal?.pid !== oldVal?.pid) {
    return true;
  } else if (newVal?.rev !== oldVal?.rev) {
    return true;
  }
  return false;
}

export function hasEntityArrayChanged<T>(
  newVal: IEntity<T>[] | undefined,
  oldVal: IEntity<T>[] | undefined,
) {
  if ((newVal?.length ?? 0) !== (oldVal?.length ?? 0)) {
    return true;
  }
  for (let i = 0; i < (newVal?.length ?? 0); i++) {
    if (newVal?.[i]?.pid !== oldVal?.[i]?.pid) {
      return true;
    } else if (newVal?.[i]?.rev !== oldVal?.[i]?.rev) {
      return true;
    }
  }
  return false;
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

type ErrValSchema<T> =
  | v.BaseSchema<unknown, T, v.BaseIssue<unknown>>
  | v.BaseSchemaAsync<unknown, T, v.BaseIssue<unknown>>;
export class DataValidationError<T> extends Error {
  err: v.ValiError<ErrValSchema<T>>;
  errors: { path: string; message: string }[];
  constructor(err: v.ValiError<ErrValSchema<T>>) {
    const errors = err.issues.map((e) => ({
      path: v.getDotPath(e) ?? "",
      message: e.message,
    }));
    super(
      `Data validation failed with ${err.issues.length} errors: ${JSON.stringify(errors)}`,
    );
    this.err = err;
    this.errors = errors;
  }

  isFor<U>() {
    return v.isValiError<ErrValSchema<U>>(this);
  }
}
