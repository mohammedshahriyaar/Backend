//the whole idea here is to upload file to local server then push that from there to cloudinary

import {v2 as cloudinary}  from "cloudinary"
import fs from "fs"
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async(localFilePath)=>{
    try {

        if(!localFilePath) return null
        //if found upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file successfully uploaded
        console.log("file uploaded to cloudinary",response.url);
        return response;
    } catch (error) {
        //error may happen due to
        //1.upload failed
        //2.file is still on server so it maybe malicious so best is to remove it from server
        fs.unlinkSync(localFilePath) //sync because first thing is to remove that temp file as upload failed
        return null

    }
}


export {uploadOnCloudinary}






cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });


