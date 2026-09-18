/**
 * تست مستقیم Batch Expiration Service
 */

import { expireExpiredProperties } from "./src/features/property/service/expireExpiredPropertiesService";

async function main() {
  const result = await expireExpiredProperties();

  console.log(
    "Batch expiration result:",
    result
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });