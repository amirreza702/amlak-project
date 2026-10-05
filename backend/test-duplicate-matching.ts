import {
  findDuplicateMatchesService,
} from "./src/features/property/service/duplicateMatchingService";

const main = async () => {
  const results =
    await findDuplicateMatchesService(
      "shahrud-003"
    );

  console.log(
    JSON.stringify(
      results.map((result) => ({
        id: result.property.id,
        distanceMeters: result.distanceMeters,
        similarityScore: result.similarityScore,
      })),
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error);
  
});