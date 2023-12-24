import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // we shouldn't save the file with its original name because 2 user can upload files with same name
    // but in this application the file is saved in localstorage for tiny amount of time.
    // so we can go through it.
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
