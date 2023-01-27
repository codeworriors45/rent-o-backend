const AWS = require('aws-sdk');
const mime = require('mime');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const uploadFile = async(file, filename, path) => {
    try {
        if(!path) {
            path = '';
        }

        filename = path + '/' + filename;

        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: filename,
            Body: file
        }

        let data = await s3.upload(params).promise();
        let res = {
            secure_url: data.Location,
            public_id: data.key
        }

        return { success: true , data:res }
    } catch (error) {
        return { success : false , data: error}
    }
}

const deleteFile = async(keys) => {
    try {
        const params = {
            Bucket: process.env.AWS_BUCKET,
            Delete: {
                Objects : 
                    keys.map((key) => {
                        return { Key : key.public_id }
                    })
                
            },
        }

        // let data = await s3.deleteObject(params).promise();
        let data = await s3.deleteObjects(params).promise();

        return { success: true , data }
    } catch (error) {
        return { success: false , data: error }
    }
}

module.exports = { uploadFile, deleteFile };