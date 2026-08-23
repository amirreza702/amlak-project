import express from "express";
import cors from "cors";

import propertyRoutes from "./features/property/routes/propertyRoutes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.use(propertyRoutes);

app.listen(4000, () => {
  console.log(
    "Backend running on http://localhost:4000"
  );
});