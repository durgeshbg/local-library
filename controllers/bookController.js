const Book = require('../models/book');
const Author = require('../models/author');
const BookInstance = require('../models/bookinstance');
const Genre = require('../models/genre');
const { body, validationResult } = require('express-validator');

const asyncHandler = require('express-async-handler');

exports.index = asyncHandler(async (req, res, next) => {
  const [numBooks, numAuthors, numBookInstances, numBookInstancesAvailabe, numGenres] =
    await Promise.all([
      Book.countDocuments({}).exec(),
      Author.countDocuments({}).exec(),
      BookInstance.countDocuments({}).exec(),
      BookInstance.countDocuments({ status: 'Available' }).exec(),
      Genre.countDocuments({}).exec(),
    ]);

  res.render('index', {
    title: 'Local Library Home',
    book_count: numBooks,
    author_count: numAuthors,
    book_instance_count: numBookInstances,
    book_instance_available_count: numBookInstancesAvailabe,
    genre_count: numGenres,
  });
});

exports.book_list = asyncHandler(async (req, res, next) => {
  const books = await Book.find({}, 'title author')
    .sort({ title: 1 })
    .populate('author')
    .exec();

  res.render('books', { title: 'Books', books });
});

exports.book_detail = asyncHandler(async (req, res, next) => {
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate('genre').populate('author').exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);
  if (book === null) {
    const err = new Error('Book not found!');
    err.status = 404;
    return next(err);
  }
  res.render('book_detail', {
    title: book.title,
    book,
    bookInstances,
  });
});

exports.book_create_get = asyncHandler(async (req, res, next) => {
  const [authors, genres] = await Promise.all([
    Author.find().sort({ first_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);
  res.render('book_form', {
    title: 'Create Book',
    authors,
    genres,
  });
});

exports.book_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre = typeof req.body.genre === 'undefined' ? [] : [req.body.genre];
    }
    next();
  },
  body('title', 'Title cannot be empty').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author cannot be empty').trim().isLength({ min: 1 }).escape(),
  body('summary', 'Summary cannot be empty').trim().isLength({ min: 1 }).escape(),
  body('isbn', 'ISBN cannot be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      const [authors, genres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      for (const genre of genres) {
        if (book.genre.includes(genre._id)) {
          genre.checked = 'true';
        }
      }
      res.render('book_form', {
        title: 'Create Book',
        authors,
        genres,
        book,
        errors: errors.array(),
      });
    } else {
      await book.save();
      res.redirect(book.url);
    }
  }),
];

exports.book_delete_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book delete GET');
});

exports.book_delete_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book delete POST');
});

exports.book_update_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book update GET');
});

exports.book_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book update POST');
});
