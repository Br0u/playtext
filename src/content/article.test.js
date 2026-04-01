import { describe, expect, it } from "vitest";

import { article } from "./article.js";

describe("article content", () => {
  it("stops at the paragraph ending with '我也茫茫然跟着旋转。'", () => {
    expect(article.paragraphs).toHaveLength(3);
    expect(article.paragraphs.at(-1)).toBe(
      "去的尽管去了，来的尽管来着；去来的中间，又怎样地匆匆呢？早上我起来的时候，小屋里射进两三方斜斜的太阳。太阳他有脚啊，轻轻悄悄地挪移了；我也茫茫然跟着旋转。"
    );
  });
});
