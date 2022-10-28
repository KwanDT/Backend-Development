import express from "express";
import bodyParser from "body-parser";
import postRouter from "./apps/posts.js";

const init = async () => {
  const app = express();
  const port = 4000;

  app.use(bodyParser.json());
  app.use("/posts", postRouter);

  app.get("/", (req, res) => {
    res.send("Hello World! Welcome");
  });

  app.get("*", (req, res) => {
    res.status(404).send("Not found");
  });

  app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
  });
};

init();
