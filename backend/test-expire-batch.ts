/**
 * تست مستقیم Property Expiration Job
 */

import {
  expirePropertiesJob,
} from "./src/features/property/job/expirePropertiesJob";

async function main() {
  const result =
    await expirePropertiesJob();

  console.log(
    "Job result:",
    result
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });