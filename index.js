const express = require('express')
const dotenv = require('dotenv')
const cloudinary = require("cloudinary").v2;
const expressFileUpload = require("express-fileupload");
const cors = require('cors')
const sharp = require('sharp');

// let CloudmersiveImageApiClient = require('cloudmersive-image-api-client');
// let defaultClient = CloudmersiveImageApiClient.ApiClient.instance;
// let Apikey = defaultClient.authentications['Apikey'];


dotenv.config()
const app = express()


app.use(expressFileUpload({ useTempFiles: true }));
app.use(cors())

//Configure environment variables, Create account on cloudinary and find name, key and secret on Dashboard
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});


const fileUploader = (file) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file.tempFilePath, (error, result) => {
            return result ? resolve(result) : reject(error);
        });
    });
};

sharp('google.png')
  .composite([
    {
      input: 'cutout-mask.png',
      blend: 'out'
    }
  ])
  .toFile('image-with-cutout.jpg', (err, info) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log(info);
    }
  });

//API call that contains image
app.post("/file-upload", async (req, res) => {

    try {

        let file = req.files.file
        fileUploader(req.files.file).then(result => {
            res.status(400).send({ success: true, msg: "Uploaded", data: result });
        }).catch(error => {
            res.status(400).send({ success: false, msg: "Failed", data: error });
        })

    } catch (error) {
        res.status(400).send({ success: false, msg: `Error occured` });
    }
});


app.listen(process.env.PORT, () => {
    console.log(`Server running at ${process.env.PORT}`)
})