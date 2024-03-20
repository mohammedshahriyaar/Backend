import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,"./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ storage: storage })


  //things to takecare is file name handle we are choosing originalfilename to be held on server 
  //however it stays for little time on erver there should be a goodway to have unique filenames,because there may be a conflict if we try to upload multiple files with same name
  //after uploading to cloudinary no issues eod we get a url from cloud