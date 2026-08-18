import { describe, expect, it } from "vitest";

import { withBase } from "../src/lib/paths";

describe("withBase", () => {
  it("keeps root-relative paths on the default base", () => {
    expect(withBase("/")).toBe("/");
    expect(withBase("/work/")).toBe("/work/");
    expect(withBase("/agencies/acme/")).toBe("/agencies/acme/");
    expect(withBase("/#directory")).toBe("/#directory");
  });
});
