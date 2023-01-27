const mime = require('mime');

const imageValidation = {
    base64: (data) => {
        let image = data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if(image == null){
            return false;
        }

        if(image.length != 3){
            return false;
        }
        let extension = mime.getExtension(image[1]);

        if(extension == 'jpg' || extension == 'png' || extension == 'jpeg' || extension == 'webp') {
            return true;
        } else {
            return false;
        }
    }
}

module.exports = imageValidation;