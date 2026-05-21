import connectionDB from "../db/connectionDB.js";
import { AppError } from "./utils/classError.js";
import { globalErrorHandling } from "./utils/globalErrorHandling.js";
import * as routers from "./modules/index.routes.js";
import { deleteFromCloudinary } from "./utils/deleteFromCloudinary.js";
import { deleteFromDB } from "./utils/deleteFromDB.js";
import cors from "cors";
import { createHandler } from 'graphql-http/lib/use/express';
import { productSchema } from "./modules/products/graphql/schema.js";
import playground from 'graphql-playground-middleware-express'
const expressPlayground = playground.default




export const initApp = (app, express) => {
  app.use(cors());

  app.use((req,res,next)=>{
    if(req.originalUrl== "/orders/webhook"){
      next()
    }else{
      express.json()(req,res,next)
    }
  });

  app.get("/", (req, res, next) => {
    res.status(200).json({ msg: "hello on my project" });
  });

  app.use("/users", routers.userRouter);
  app.use("/categories", routers.categoryRouter);
  app.use("/subCategories", routers.subCategoryRouter);
  app.use("/brands", routers.brandRouter);
  app.use("/products", routers.productRouter);
  app.use("/coupons", routers.couponRouter);
  app.use("/carts", routers.cartRouter);
  app.use("/orders", routers.orderRouter);
  app.use("/reviews", routers.reviewRouter);
  app.use("/wishList", routers.wishListRouter);


  app.use('/graphql', createHandler({ schema:productSchema }));
  app.get('/playground', expressPlayground({ endpoint: '/graphql' }))


  //connect to db
  connectionDB();

  //handle invalid URLS
  app.use("*", (req, res, next) => {
    next(new AppError(`inValid url ${req.originalUrl}`, 404));
  });

  //global error handling middleware
  app.use(globalErrorHandling, deleteFromCloudinary, deleteFromDB);
};
