import { ObjectId } from "mongodb";
import { Router } from "express";
import { db } from "../utils/db.js";

const quoraRouter = Router();

quoraRouter.get("/", async (req, res) => {
  const collection = db.collection("questions");

  const quora = await collection
    .find({ category: Software })
    .limit(10) // limit the result documents by 10
    .toArray(); // convert documents into an array

  return res.json({ data: quora });
});

quoraRouter.post("/", async (req, res) => {
  const collection = db.collection("questions");

  const quoraData = { ...req.body };
  const questions = await collection.insertOne(quoraData);
  return res.json({
    message: `Question (${question.insertId}) has been added successfully`,
  });
});

quoraRouter.put("/:questionId", async (req, res) => {
  const collection = db.collection("questions");

  const questionId = ObjectId(req.params.questionId);
  const newQuoraData = { ...req.body };

  await collection.updateOne(
    {
      _id: questionId,
    },
    {
      $set: newQuoraData,
    }
  );

  return res.json({
    message: `Question (${questionId}) has been updated successfully`,
  });
});

quoraRouter.delete("/:questionId", async (req, res) => {
  const collection = db.collection("questions");

  const questionId = ObjectId(req.params.questionId);

  await collection.deleteOne({
    _id: questionId,
  });

  return res.json({
    message: `Question (${questionId}) has been deleted successfully`,
  });
});

export default quoraRouter;
