/**
 * Get a property from an object following the JSON Pointer spec.
 *
 * RFC / Standard: https://www.rfc-editor.org/rfc/rfc6901
 *
 * Implementation adapted from https://github.com/manuelstofer/json-pointer/blob/931b0f9c7178ca09778087b4b0ac7e4f505620c2/index.js#L48-L59
 *
 * @param obj
 * @param pointer
 */
export const jsonPointerGet = (
  obj: Record<string, any>,
  pointer: string
): string | Record<string, any> => {
  const unescape = (str: string) => str.replace(/~1/g, "/").replace(/~0/g, "~");
  const parse = (pointer: string) => {
    if (pointer === "") {
      return [];
    }
    if (pointer.charAt(0) !== "/") {
      throw new Error("Invalid JSON pointer: " + pointer);
    }
    return pointer.substring(1).split(/\//).map(unescape);
  };

  const refTokens = Array.isArray(pointer) ? pointer : parse(pointer);

  for (let i = 0; i < refTokens.length; ++i) {
    const tok = refTokens[i];
    if (!(typeof obj === "object" && tok in obj)) {
      throw new Error("Invalid reference token: " + tok);
    }
    obj = obj[tok];
  }
  return obj;
};
