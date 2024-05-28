const BookInstance = require('../models/bookinstance');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Book = require('../models/book');
const debug = require('debug')('bookinstance:');

exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const book_instances = await BookInstance.find().populate('book').exec();

  res.render('book_instances', { title: 'Book Instances List', book_instances });
});

exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).populate('book').exec();

  if (bookInstance === null) {
    const err = new Error('Book copy not found');
    debug(`detail not found: ${req.params.id}`);
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
  const bookinstance = await BookInstance.findById(req.params.id).exec();
  if (bookinstance === null) {
    res.redirect('/catalog/bookinstances');
  }
  res.render('bookinstance_delete', {
    title: 'Delete BookInstance',
    bookinstance,
  });
});

exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  await BookInstance.findByIdAndDelete(req.body.bookinstance_id);
  res.redirect('/catalog/bookinstances');
});

exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const [bookinstance, books] = await Promise.all([
    BookInstance.findById(req.params.id).exec(),
    Book.find({}, 'title summary').exec(),
  ]);
  res.render('bookinstance_form', {
    title: 'Update BookInstance',
    bookinstance,
    books,
    selected_book: bookinstance.book,
  });
});

exports.bookinstance_update_post = [
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
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      const books = await Book.find({}, 'title').sort({ title: 1 }).exec();
      res.render('bookinstance_form', {
        title: 'Update BookInstance',
        books,
        bookinstance,
        selected_book: bookinstance.book,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedBookInstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        bookinstance,
        {}
      );
      res.redirect(updatedBookInstance.url);
    }
  }),
];
