// Version management for Vantage application
import packageJson from "../../package.json";

const APP_VERSION = packageJson.version;
const APP_NAME = packageJson.name;

// Helper to get version info
export function getVersionInfo() {
  const [major, minor, patch] = APP_VERSION.split(".").map(Number);

  const buildDate =
    import.meta.env.VITE_BUILD_DATE || new Date().toISOString().split("T")[0];
  const gitHash = import.meta.env.VITE_GIT_HASH || "unknown";

  return {
    version: APP_VERSION,
    major,
    minor,
    patch,
    name: APP_NAME,
    displayVersion: `${buildDate}-${gitHash}`,
    buildDate,
    gitHash,
  };
}

// TODO: re-implement version comparison when needed
// // Version comparison helpers
// function isVersionNewer(
//   currentVersion: string,
//   compareVersion: string
// ): boolean {
//   const [currentMajor, currentMinor, currentPatch] = currentVersion
//     .split(".")
//     .map(Number);
//   const [compareMajor, compareMinor, comparePatch] = compareVersion
//     .split(".")
//     .map(Number);

//   if (currentMajor !== compareMajor) return currentMajor > compareMajor;
//   if (currentMinor !== compareMinor) return currentMinor > compareMinor;
//   return currentPatch > comparePatch;
// }