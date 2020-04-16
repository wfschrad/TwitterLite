const express = require('express');
const { Tweet } = require('../db/models')
const asyncHandler = require('../utils');
const { check, validationResult } = require('express-validator');

const router = express.Router();

const tweetValidators = [
    check('message')
        .exists({ checkFalsy: true })
        .withMessage('Must provide a tweet message')
        .isLength({ max: 280 })
        .withMessage('Tweet must be under 280 characters')
];

const handleValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        const errors = validationErrors.array().map((error) => error.msg);

        const err = Error("Bad request.");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad request.";
        next(err);
    }
    next();
};

router.get("/", asyncHandler(async (req, res) => {
    const tweets = await Tweet.findAll();
    res.json({ tweets });
}));

router.get("/:id(\\d+)", asyncHandler(async (req, res, next) => {
    const tweetId = req.params.id
    const tweet = await Tweet.findByPk(tweetId);
    if (tweet) {
        res.json({ tweet });
    } else {
        const err = new Error();
        err.title = "Tweet Not Found";
        err.status = 404
        next(err);
    }
}));

router.post('/', tweetValidators, handleValidationErrors, asyncHandler(async (req, res) => {
    const { message } = req.body;
    const newTweet = await Tweet.create({ message });
    res.status(201).json({ newTweet });
}));

router.put('/:id(\\d+)', tweetValidators, handleValidationErrors, asyncHandler(async (req, res, next) => {
    const tweetId = req.params.id
    const { message } = req.body;
    const tweet = await Tweet.findByPk(tweetId);

    if (tweet) {
        await tweet.update({ message });
        res.json({ tweet });
    } else {
        const err = new Error();
        err.title = "Tweet Not Found";
        err.status = 404
        next(err);
    }
}));

router.delete('/:id(\\d+)', tweetValidators, handleValidationErrors, asyncHandler(async (req, res, next) => {
    const tweetId = req.params.id
    const tweet = await Tweet.findByPk(tweetId);

    if (tweet) {
        await tweet.destroy();
        res.status(204).end();
    } else {
        const err = new Error();
        err.title = "Tweet Not Found";
        err.status = 404
        next(err);
    }
}));


module.exports = router;