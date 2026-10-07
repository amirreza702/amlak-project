import {
  calculatePropertySimilarity,
} from "./src/features/property/service/propertySimilarityService";

const primary = {
  postalCode: "1111111111",
  propertyType: "APARTMENT",
  city: "شاهرود",
  district: "مرکز شهر",
  area: 100,
  rooms: 2,
} as any;

const candidate = {
  postalCode: "1111111111",
  propertyType: "APARTMENT",
  city: "شاهرود",
  district: "مرکز شهر",
  area: 14.2857142857,
  rooms: 3,
} as any;

const score = calculatePropertySimilarity(
  primary,
  candidate
);

console.log("Similarity Score:", score);
console.log("Is exactly 0.80:", score === 0.8);