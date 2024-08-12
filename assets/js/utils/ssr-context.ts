// NB(@zkat): Lit SSR doesn't work with Context, so we basically disable
// context entirely in SSR. As such, our components should NOT rely on context
// always working in order to work at all (this should be fine most of the
// time, I think?), and should always use this module instead of @lit/context
// directly.
//
// See https://github.com/lit/lit/issues/3301

import { consume, Context, provide } from "@lit/context";
import { isServer, LitElement } from "lit";

if (isServer && !LitElement.prototype.addEventListener) {
  LitElement.prototype.addEventListener = () => {};
}

export function ssrProvide<ValueType>({
  context: context,
}: {
  context: Context<unknown, ValueType>;
}) {
  const dec = isServer ? provide({ context }) : undefined;
  // @ts-expect-error idc
  return (x, y) => {
    if (dec) {
      dec(x, y);
    }
  };
}

export function ssrConsume<ValueType>({
  context,
  subscribe,
}: {
  context: Context<unknown, ValueType>;
  subscribe?: boolean;
}) {
  const dec = isServer ? consume({ context, subscribe }) : undefined;
  // @ts-expect-error idc
  return (x, y) => {
    if (dec) {
      dec(x, y);
    }
  };
}
