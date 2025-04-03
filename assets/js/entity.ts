import { StoreNames } from "idb";
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

const baseEntitySchema = v.object({
  pid: v.string(),
  rev: v.optional(v.string()),
  revisions: v.optional(v.array(v.string())),
  deleted_at: v.optional(v.nullish(v.string())),
  data: v.any(),
});

export const entitySchema = v.object({
  ...baseEntitySchema.entries,
  ...v.object({
    conflict: v.optional(v.nullish(baseEntitySchema)),
  }).entries,
});

export type ITSchema<T> =
  & v.BaseSchema<unknown, T, v.BaseIssue<unknown>>
  & v.ObjectSchema<v.ObjectEntries, v.ErrorMessage<v.ObjectIssue> | undefined>;

export class Entity<T> implements IEntity<T> {
  static makeSchema<T>(dataSchema: ITSchema<T>): ITSchema<IEntity<T>> {
    return v.object({
      ...entitySchema.entries,
      ...v.object({
        data: dataSchema,
      }).entries,
    });
  }

  get storeName(): StoreNames<BlackIronDBSchema> {
    throw new Error("No store name defined for entity.");
  }

  get baseRoute() {
    return "/";
  }

  get route() {
    return "/_abstract";
  }

  get schema(): v.BaseSchema<unknown, IEntity<T>, v.BaseIssue<unknown>> {
    return entitySchema;
  }

  pid: string;
  rev?: string;
  revisions?: string[];
  conflict?: IBaseEntity<T> | null;
  deleted_at?: string | null;
  data: T;

  constructor(data: IEntity<T>) {
    try {
      const parsed = v.parse(this.schema, data);
      this.pid = parsed.pid;
      this.rev = parsed.rev;
      this.revisions = parsed.revisions;
      this.conflict = parsed.conflict;
      this.deleted_at = parsed.deleted_at;
      this.data = parsed.data;
    } catch (e) {
      if (v.isValiError(e)) {
        throw new DataValidationError(e);
      }
      throw e;
    }
  }

  bumpRev() {
    this.rev = crypto.randomUUID();
    this.revisions = this.revisions ?? [];
    this.revisions.unshift(this.rev);
  }

  eq(other: IEntity<T>): boolean {
    return this.pid === other.pid && this.deleted_at == other.deleted_at;
  }

  // eslint-disable-next-line
  merge(other: IEntity<T>): this {
    throw new Error("Not implemented");
  }

  toEntity(): IEntity<T> {
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
    return objectToFormData(this, [
      "pid",
      "rev",
      "revisions",
      "deleted_at",
      "data",
    ]);
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
