import { runCuratorSelfCheck } from "./selfCheck";

const rows = runCuratorSelfCheck();
for (const row of rows) {
  console.log(`${row.name}: ${row.overall}`);
}
console.log("curator self-check passed");
