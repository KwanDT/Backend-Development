import { Router } from "express";
import { pool } from "utils/db.js";

const postRouter = Router();

// Query all posts
postRouter.get("/", async (req, res) => {
  try {
    const keyword = req.query.keywords || "";
    const category = req.query.category || "";

    let query = "";
    let values = [];

    if (keyword && category) {
      query = `SELECT posts.*
        FROM posts
        INNER JOIN posts_categories
        ON posts.post_id = posts_categories.post_id
        INNER JOIN categories
        ON posts_categories.category_id = categories.category_id
        WHERE posts.title ILIKE $1 AND categories.name ILIKE $2;`;
      values = [keyword, category];
    } else if (keyword) {
      query = `SELECT *
        FROM posts
        WHERE title ILIKE $1;`;
      values = [keyword];
    } else if (category) {
      query = `SELECT posts.*
        FROM posts
        INNER JOIN posts_categories
        ON posts.post_id = posts_categories.post_id
        INNER JOIN categories
        ON posts_categories.category_id = categories.category_id
        WHERE categories.name ILIKE $1;`;
      values = [category];
    } else {
      query = `SELECT *
        FROM posts;`;
    }

    const results = await pool.query(query, values);
    return res.json({
      data: results.rows,
    });
  } catch (error) {
    return res.json({
      data: error,
    });
  }
});

// Query a post
postRouter.get("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const result = await pool.query(
      `
        SELECT * 
        FROM posts 
        WHERE post_id = $1`,
      [postId]
    );
    return res.json({
      data: result.rows[0],
    });
  } catch (error) {
    return res.json({
      data: error,
    });
  }
});

// Create a new post
postRouter.post("/", async (req, res) => {
  try {
    const media = req.body.url || "";
    const categories = req.body.category || "";

    // add post into the "post" table
    const newPost = {
      ...req.body,
      created_at: new Date(),
    };
    const addPost = await pool.query(
      `INSERT INTO posts (user_id, title, content, created_at) VALUES ($1, $2, $3, $4) RETURNING *`,
      [newPost.user_id, newPost.title, newPost.content, newPost.created_at]
    );

    // add media of the post into "post_media" table
    const postId = addPost.rows[0].post_id;
    if (media) {
      for (let url of media) {
        await pool.query(
          `INSERT INTO post_media (post_id, url) VALUES ($1, $2)`,
          [postId, url]
        );
      }
    }

    // add categories of the post into "posts_categories" table
    if (categories) {
      for (let category of categories) {
        // First: find the category_id from "categories" table
        const result = await pool.query(
          `SELECT * FROM categories WHERE name ILIKE $1`,
          [category]
        );
        const categoryId = result.rows[0].category_id;
        // Second: add the category_id and post_id into "posts_categories" table
        await pool.query(
          `INSERT INTO posts_categories (post_id, category_id) VALUES ($1, $2)`,
          [postId, categoryId]
        );
      }
    }

    return res.json({
      message: "post has been added successfully",
    });
  } catch (error) {
    return res.json({
      data: error,
    });
  }
});

// Upvote or downvote a post
postRouter.post("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const newVote = {
      ...req.body,
      post_id: postId,
    };

    await pool.query(
      `INSERT INTO post_votes (post_id, user_id, type)
    VALUES ($1, $2, $3)`,
      [newVote.post_id, newVote.user_id, newVote.type]
    );
    return res.json({
      message: "post has been voted successfully",
    });
  } catch (error) {
    return res.json({
      data: error,
    });
  }
});

// Comment in a post
postRouter.post("/:postId/comments", async (req, res) => {
  try {
    const media = req.body.url || "";
    const postId = req.params.postId;
    const newComment = {
      ...req.body,
      post_id: postId,
      created_at: new Date(),
    };
    const addComment = await pool.query(
      `INSERT INTO comments (post_id, user_id, content, created_at)
      VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        newComment.post_id,
        newComment.user_id,
        newComment.content,
        newComment.created_at,
      ]
    );

    // add media of the comment into "comment_media" table
    const commentId = addComment.rows[0].comment_id;
    if (media) {
      for (let url of media) {
        await pool.query(
          `INSERT INTO comment_media (comment_id, url) VALUES ($1, $2)`,
          [commentId, url]
        );
      }
    }

    return res.json({
      message: "comment has been added successfully",
    });
  } catch (error) {
    return res.json({
      data: error,
    });
  }
});

// Upvote or downvote a comment
postRouter.post("/:postId/comments/:commentId", async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const newVote = {
      ...req.body,
      comment_id: commentId,
    };
    await pool.query(
      `INSERT INTO comment_votes (comment_id, user_id, type)
    VALUES ($1, $2, $3)`,
      [newVote.comment_id, newVote.user_id, newVote.type]
    );
    return res.json({
      message: "comment has been voted successfully",
    });
  } catch (error) {
    return res.json({
      data: error,
    });
  }
});

// Update a post
postRouter.put("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const updatedPost = {
      ...req.body,
      updated_at: new Date(),
    };
    await pool.query(
      `UPDATE posts
    SET title = $1, content = $2, updated_at = $3
    WHERE post_id = $4`,
      [updatedPost.title, updatedPost.content, updatedPost.updated_at, postId]
    );
    return res.json({
      message: "post has been updated successfully",
    });
  } catch (error) {
    return res.json({
      data: error,
    });
  }
});

// Delete a post
postRouter.delete("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    await pool.query(
      `DELETE FROM posts
    WHERE post_id = $1`,
      [postId]
    );
    return res.json({
      message: "post has been deleted successfully",
    });
  } catch (error) {
    return res.json({
      data: error,
    });
  }
});

export default postRouter;
