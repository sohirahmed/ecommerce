import express from "express";
import * as CC from "./category.controller.js";
import * as CV from "./category.validation.js";
import { multerHost, validExtension } from "../../middleware/multer.js";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { systemRoles } from "../../utils/systemRoles.js";
import subCategoryRouter from "../subCategories/subCategory.routes.js";

const categoryRouter = express.Router();

categoryRouter.use("/:categoryId/subCategories",subCategoryRouter);

categoryRouter.get("/",
auth(Object.values(systemRoles)),
CC.getCategories);

categoryRouter.post(
  "/",
  multerHost(validExtension.image).single("image"),
  validation(CV.createCategory),
  auth([systemRoles.admin]),
  CC.createCategory
);

categoryRouter.put(
  "/:id",
  multerHost(validExtension.image).single("image"),
  validation(CV.updateCategory),
  auth([systemRoles.admin]),
  CC.updateCategory
);

categoryRouter.delete(
  "/:id",
  auth(Object.values(systemRoles)),
  CC.deleteCategory
);

export default categoryRouter;
