import {
  decode,
  GIF,
  Image,
} from "https://deno.land/x/imagescript@v1.2.14/mod.ts";
import { normalize, join } from "https://deno.land/std@0.153.0/path/mod.ts";
import { rgb24 } from "https://deno.land/std@0.153.0/fmt/colors.ts";

type Options = {
  width: number;
  grayscale?: boolean;
  ratioFactor?: number;
  charMap?: string;
};

export const convert = async (
  path: string,
  opts: Options = {
    width: 100,
    grayscale: false,
    ratioFactor: 1.75,
    charMap: "@#8&o:*., ",
  }
) => {
  const resolvedPath = join(Deno.cwd(), normalize(path));

  let file;
  try {
    file = await Deno.readFile(resolvedPath);
  } catch {
    throw new Error(`Failed to open "${resolvedPath}"`);
  }

  const image = await decode(file);

  if (image instanceof GIF) {
    throw new Error("GIF files not supported");
  }

  const grayscale = opts.grayscale ? image.saturation(0) : image;
  const originalRatio = grayscale.width / grayscale.height;
  const newHeight = (originalRatio * opts.width) / (opts.ratioFactor || 2.25);
  const resized = grayscale.resize(opts.width, newHeight);

  const characterMap = (opts.charMap || "@").split("").reverse();
  /* const characterMap =
  "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,\"^`'.".split(
    ""
  ); */
    
  let out = "";
  let row = 1;

  for (const [x, y, color] of resized.iterateWithColors()) {
    if (row !== y) {
      out += "\n";
      row++;
    }

    const [red, green, blue, alpha] = Image.colorToRGBA(color);
    const [_hue, _saturation, luminance] = Image.rgbaToHSLA(
      red,
      green,
      blue,
      alpha
    );

    let targetCharIndex = Math.round(characterMap.length * luminance);
    targetCharIndex = targetCharIndex < 0 ? 0 : targetCharIndex;
    targetCharIndex =
      targetCharIndex > characterMap.length - 1
        ? characterMap.length - 1
        : targetCharIndex;

    if (alpha !== 255) {
      out += " ";
      continue;
    }

    out += rgb24(characterMap[targetCharIndex], {
      r: red,
      g: green,
      b: blue,
    });
  }

  console.log(out);
};;
