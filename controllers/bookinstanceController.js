const BookInstance = require('../models/bookinstance');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Book = require('../models/book');

exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const book_instances = await BookInstance.find().populate('book').exec();

  res.render('book_instances', { title: 'Book Instances List', book_instances });
});

exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).populate('book').exec();

  if (bookInstance === null) {
    const err = new Error('Book copy not found');
    err.status = 404;
    return next(err);
  }

  res.render('bookinstance_detail', {
    title: 'Book:',
    bookinstance: bookInstance,
  });
});

exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const books = await Book.find({}, 'title').sort({ title: 1 }).exec();
  res.render('bookinstance_form', {
    title: 'Create BookInstance',
    books,
  });
});

exports.bookinstance_create_post = [
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
  body('status').escape(),
  body('due_back', 'Invalid date').optional({ values: 'falsy' }).isISO8601().toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });
    if (!errors.isEmpty()) {
      const books = await Book.find({}, 'title').sort({ title: 1 }).exec();
      res.render('bookinstance_form', {
        title: 'Create BookInstance',
        books,
        bookinstance,
        selected_book: bookinstance.book,
        errors: errors.array(),
      });
      return;
    } else {
      await bookinstance.save();
      res.redirect(bookinstance.url);
    }
  }),
];

exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: BookInstance delete GET');
});

exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: BookInstance delete POST');
});

exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: BookInstance update GET');
});

exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: BookInstance update POST');
});
