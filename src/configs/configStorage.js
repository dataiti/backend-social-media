const multer = require("multer");
const path = require("path");

const uploadFilePath = path.resolve(__dirname, "../", "publics/uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFilePath);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${new Date().getTime().toString()}-${file.fieldname}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
  },
  fileFilter: (req, file, cb) => {
    const extension =
      [".png", ".jpg", ".jpeg"].indexOf(
        path.extname(file.originalname).toLowerCase()
      ) >= 0;
    const mimeType =
      ["image/png", "image/jpg", "image/jpeg"].indexOf(file.mimetype) >= 0;
    if (extension && mimeType) {
      return cb(null, true);
    }
    cb(new Error("Invalid file type !"));
  },
});

module.exports = upload;
