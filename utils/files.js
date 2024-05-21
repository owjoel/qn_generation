import fs from "fs";

import multer from "multer";
import xlsx from "xlsx";

xlsx.set_fs(fs);

export const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Storage engine with multer
export const fileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (_req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

export const createJSONFromFile = (filename, filepath) => {
  const wb = xlsx.readFile(filepath);
  const sheetName = wb.SheetNames[0];
  const sheetValue = wb.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheetValue);
  const newPath = `./public/uploads/${filename}.json`
  fs.writeFile(
    newPath,
    JSON.stringify(data, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("JSON saved to " + newPath);
      }
    }
  );
  return newPath;
};

export const createExcelFromJSON = (result, course, topic) => {
  try {
    const filename = './public/output/' + course + '-' + topic + '.xlsx';
    console.log(filename);
    const sheet = xlsx.utils.json_to_sheet(result);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, sheet, "Questions");
    xlsx.writeFileXLSX(wb, filename)
    // console.log(output);
  } catch (err) {
    console.log(err);
  }
}