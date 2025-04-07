const outerRe = /^([^[\]]+)(.*)$/;
const regex = /\[([^[\]]*)\]/g;

export function formDataToObject(data: FormData | HTMLFormElement): Record<string, unknown> {
  if (globalThis.HTMLFormElement && data instanceof globalThis.HTMLFormElement) {
    data = new FormData(data);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: Record<string, any> = {};
  for (const [name, val] of data.entries()) {
    const parsedKey = parseKey(name);
    if (!parsedKey) {
      continue;
    }
    let currentObj = obj;
    let lastKey: string | number | undefined;
    for (const key of parsedKey.path) {
      const numKey = parseInt(key, 10);
      if (lastKey != null) {
        if (isNaN(numKey)) {
          if (currentObj[lastKey] == null) {
            currentObj[lastKey] = {};
          }
          currentObj = currentObj[lastKey];
        } else {
          if (currentObj[lastKey] == null) {
            currentObj[lastKey] = [];
          }
          currentObj = currentObj[lastKey];
        }
      }
      lastKey = isNaN(numKey) ? key : numKey;
    }
    if (lastKey != null) {
      currentObj[lastKey] = val;
    }
  }
  // TODO(@zkat): some sort of verifier so we can actually guaranatee
  // we're returning what we're supposed to.
  return obj;
}

export function objectToFormData<T>(
  obj: T,
  fields?: string[],
  prefix: string = "entity",
): FormData {
  const formData = new FormData();
  setValues(formData, obj, prefix, fields);
  return formData;
}

function setValues(formData: FormData, val: unknown, key: string = "", fields?: string[]) {
  if (val == null) {
    return;
  } else if (Array.isArray(val)) {
    for (const [idx, subVal] of val.entries()) {
      if (subVal == null) {
        continue;
      }
      setValues(formData, subVal, key + `[${idx}]`);
    }
  } else if (typeof val === "object") {
    for (const [subKey, subVal] of Object.entries(val)) {
      if (subVal == null || (fields && !fields.includes(subKey))) {
        continue;
      }
      setValues(formData, subVal, key + `[${subKey}]`);
    }
  } else {
    formData.append(key, "" + val);
  }
}

function parseKey(key: string) {
  const match = key.match(outerRe);
  if (match) {
    const pathSteps = [...match[2].matchAll(regex)].map((match) => match[1]);
    return {
      name: match[1],
      path: pathSteps,
    };
  }
}
