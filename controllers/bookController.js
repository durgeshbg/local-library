const Book = require('../models/book');
const Author = require('../models/author');
const BookInstance = require('../models/bookinstance');
const Genre = require('../models/genre');

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
  res.send(`NOT IMPLEMENTED: Book detail: ${req.params.id}`);
});

exports.book_create_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book create GET');
});

exports.book_create_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book create POST');
});

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
