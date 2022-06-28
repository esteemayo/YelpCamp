const uuid = require('uuid');
const sharp = require('sharp');
const multer = require('multer');

const catchErrors = require('../utils/catchErrors');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  return cb(new Error('Only image files are allowed'), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.upload = upload.single('avatar');

exports.resize = catchErrors(async (req, res, next) => {
  if (!req.file) return next();

  const ext = req.file.mimetype.split('/')[1];
  req.file.filename = `${uuid.v4()}.${ext}`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/uploads/users/${req.file.filename}`);

  next();
});
