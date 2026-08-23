import { Router } from "express";

import {
  registerPropertyController,
} from "../controller/propertyController";


const router = Router();


router.post(
  "/properties",
  registerPropertyController
);


export default router;