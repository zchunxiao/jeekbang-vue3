import fs from "node:fs";
import path from "node:path";

export function getServerDir() {
  console.log("getServerDir:", path.join(__dirname, ".."));
  return path.join(__dirname, "..");
}
