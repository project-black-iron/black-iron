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

export interface IEntity<T> {
  pid: string;
  rev?: string;
  revisions?: string[];
  conflict?: IEntity<T>;
  deleted_at?: string | null;
  data: T;
}

const baseEntitySchema = v.object({
  pid: v.string(),
  rev: v.optional(v.string()),
  revisions: v.optional(v.array(v.string())),
  deleted_at: v.optional(v.nullable(v.string())),
  data: v.any(),
});

// @ts-expect-error -- TS doesn't like this, but it's fine.
export const entitySchema = baseEntitySchema.extend({
  // @ts-expect-error -- TS doesn't like this, but it's fine.
  conflict: z.lazy(() => entitySchema.nullable().optional()),
});

// eslint-disable-next-line
export class AbstractEntity implements IEntity<any> {
  get storeName(): StoreNames<BlackIronDBSchema> {
    throw new Error("No store name defined for entity.");
  }

  get baseRoute() {
    return "/";
  }

  get route() {
    return "/_abstract";
  }

  get schema() {
    return entitySchema;
  }

  pid: string;
  rev?: string;
  revisions?: string[];
  // eslint-disable-next-line
  conflict?: IEntity<any>;
  deleted_at?: string;
  // eslint-disable-next-line
  data: any;

  // eslint-disable-next-line
  constructor(data: IEntity<any>) {
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
        throw new DataValidationError(e.issues);
      }
      throw e;
    }
  }

  bumpRev() {
    this.rev = crypto.randomUUID();
    this.revisions = this.revisions ?? [];
    this.revisions.unshift(this.rev);
  }

  // eslint-disable-next-line
  eq(other: IEntity<any>): boolean {
    return this.pid === other.pid && this.deleted_at == other.deleted_at;
  }

  // eslint-disable-next-line
  merge(other: IEntity<any>): AbstractEntity {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line
  toEntity(): IEntity<any> {
    // eslint-disable-next-line
    const entity: IEntity<any> = { pid: this.pid, data: structuredClone(this.data) };
    if (this.rev) {
      entity.rev = this.rev;
    }
    if (this.revisions) {
      entity.revisions = this.revisions;
    }
    return entity;
  }

  toFormData(): FormData {
    return objectToFormData(this, ["pid", "rev", "revisions", "deleted_at", "data"]);
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

export class DataValidationError<T> extends Error {
  errors: { path: string; message: string }[];
  constructor(values: v.BaseIssue<T>[]) {
    const errors = values.map((e) => ({ path: v.getDotPath(e) ?? "", message: e.message }));
    super(`Data validation failed with ${values.length} errors: ${JSON.stringify(errors)}`);
    this.errors = errors;
  }
}
