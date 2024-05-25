const Genre = require('../models/genre');
const Book = require('../models/book');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.genre_list = asyncHandler(async (req, res, next) => {
  const genres = await Genre.find({}).sort({ name: 1 }).exec();
  res.render('genres', { tile: 'Genres List', genres });
});

exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, 'title summary').exec(),
  ]);

  if (genre === null) {
    const err = new Error('Genre not found');
    err.status(404);
    return next(err);
  }

  res.render('genre', { title: 'Genre Detail', genre, booksInGenre });
});

exports.genre_create_get = async (req, res, next) => {
  res.render('genre_form', {
    title: 'Create Genre',
  });
};

exports.genre_create_post = [
  body('name', 'Genre name must contain aleast 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name });
    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Create Genre',
        genre,
        errors: errors.array(),
      });
      return;
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ locale: 'en', strength: 2 })
        .exec();
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        res.redirect(genre.url);
      }
    }
  }),
];

exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, genre_books] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, 'title summary').exec(),
  ]);
  if (genre === null) {
    res.redirect('/catalog/genres');
  }
  res.render('genre_delete', {
    title: 'Delete Genre',
    genre,
    genre_books,
  });
});

exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, genre_books] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, 'title summary').exec(),
  ]);
  if (genre_books.length > 0) {
    res.render('genre_delete', {
      title: 'Delete Genre',
      genre,
      genre_books,
    });
  } else {
    await Genre.findByIdAndDelete(req.body.genre_id);
    res.redirect('/catalog/genres');
  }
});

exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id);
  res.render('genre_form', {
    title: 'Update Genre',
    genre,
  });
});

exports.genre_update_post = [
  body('name', 'Genre name must contain aleast 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name, _id: req.params.id });
    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Create Genre',
        genre,
        errors: errors.array(),
      });
      return;
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ locale: 'en', strength: 2 })
        .exec();
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, genre, {});
        res.redirect(updatedGenre.url);
      }
    }
  }),
];
