var cloudinary = require('cloudinary').v2;
const mime = require('mime');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

var cloudinaryHelper = {
    upload: async(data, folder) => {
        try {
            let { public_id, secure_url } = await cloudinary.uploader.upload(data, {
                folder: 'renttoown/' + folder,
                filename_override: Date.now(),
                use_filename: true
            });
    
            var cloudimg = {
                public_id, secure_url
            }

            return { success: true, cloudimg }
        } catch (error) {
            console.log(error);
            return { success: false, error }
        }

    },

    delete: async(public_id) => {
        try {
            let img = await cloudinary.uploader.destroy(public_id);
            console.log(img);
            if(img.result === 'ok'){
                return true;
            } else{
                return false;
            }
            
        } catch (error) {
            console.log(error);
            return false;
        }

    }
}
module.exports = cloudinaryHelper;