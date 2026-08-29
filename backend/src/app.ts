import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import propertyRoutes from "./features/property/routes/propertyRoutes";
import agentRoutes from "./features/agent/routes/agentRoutes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(propertyRoutes);
app.use("/api/agents", agentRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
