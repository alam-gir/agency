import multer from "multer";
import path from "path";

// Configure Multer storage options
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/temp'); // Specify upload directory
    },
    filename: (req, file, cb) => {
      // Rename file with custom logic (e.g., add timestamp)
      const uniqueSuffix = Date.now();
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  // Create Multer upload middleware
  export const upload = multer({ storage: storage });
  