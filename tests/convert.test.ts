import { convert } from "../mod.ts";

Deno.test("convert", async () => {
  await convert("./tests/hashrock_simple.png", {
    width: 50,
    grayscale: false,
    // ratioFactor: 1,
    charMap: " .:-=+*#%@",
  });
});
