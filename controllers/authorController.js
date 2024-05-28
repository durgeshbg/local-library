const Author = require('../models/author');
const Book = require('../models/book');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const debug = require('debug')('author:');

exports.author_list = asyncHandler(async (req, res, next) => {
  const authors = await Author.find({}).sort({ family_name: 1 }).exec();

  res.render('authors', { title: 'Authors List', authors });
});

exports.author_detail = asyncHandler(async (req, res, next) => {
  const [author, authorBooks] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, 'title summary').exec(),
  ]);

  if (author === null) {
    const err = new Error('Author not found');
    debug(`detail not found: ${req.params.id}`);
    err.status = 404;
    return next(err);
  }

  res.render('author_detail', {
    title: 'Author Detail',
    author: author,
    author_books: authorBooks,
  });
});

exports.author_create_get = asyncHandler(async (req, res, next) => {
  res.render('author_form', {
    title: 'Create Author',
  });
});

exports.author_create_post = [
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth.')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),
  body('date_of_Death', 'Invalid date of death.')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });
    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Create Auhtor',
        author,
        errors: errors.array(),
      });
      return;
    } else {
      await author.save();
      res.redirect(author.url);
    }
  }),
];

exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const [author, author_books] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, 'title summary').exec(),
  ]);
  if (author === null) {
    res.redirect('/catalog/authors');
  }
  res.render('author_delete', {
    title: 'Delete Author',
    author,
    author_books,
  });
});

exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const [author, author_books] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, 'title summary').exec(),
  ]);
  if (author_books.length > 0) {
    res.render('author_delete', {
      title: 'Delete Author',
      author,
      author_books,
    });
  } else {
    await Author.findByIdAndDelete(req.body.author_id);
    res.redirect('/catalog/authors');
  }
});

exports.author_update_get = asyncHandler(async (req, res, next) => {
  const author = await Author.findById(req.params.id);
  res.render('author_form', {
    title: 'Update Author',
    author,
  });
});

exports.author_update_post = [
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth.')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),
  body('date_of_Death', 'Invalid date of death.')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Update Author',
        author,
        errors: errors.array(),
      });
    } else {
      const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, author, {});
      res.redirect(updatedAuthor.url);
    }
  }),
];
