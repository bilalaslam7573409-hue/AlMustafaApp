// src/styles/rtl-cache.js
import createCache from "@emotion/cache";
import stylisRTLPlugin from "stylis-plugin-rtl";

export default function createRtlCache() {
  return createCache({
    key: "muirtl",
    stylisPlugins: [stylisRTLPlugin],
  });
}
