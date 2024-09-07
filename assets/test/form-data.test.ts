import { deepStrictEqual } from "node:assert";
import { test } from "node:test";

import { formDataToObject } from "../js/utils/form-data.js";

test("formDataToObject", () => {
  const formData = new FormData();
  formData.append("entity[foo]", "x");
  formData.append("entity[bar]", "y");
  formData.append("entity[a][b][c]", "y");
  formData.append("entity[b][0][a]", "0");
  formData.append("entity[b][1][a]", "1");
  formData.append("entity[c][0][0]", "alpha");
  formData.append("entity[c][0][1]", "beta");
  formData.append("entity[c][1]", "gamma");
  deepStrictEqual(formDataToObject(formData), {
    foo: "x",
    bar: "y",
    a: {
      b: {
        c: "y",
      },
    },
    b: [{ a: "0" }, { a: "1" }],
    c: [["alpha", "beta"], "gamma"],
  });
});
