const multer = require('multer')

const storage = multer.diskStorage({
        destination: function (req, file, cb) {
			cb(null, './public/uploads/')
        }, 
        filename: function (req, file, cb) {
			const uniqueSuffix =  Math.round(Date.now())
            const ext = file.mimetype.split("/")[1];
			cb(null, file.fieldname + '_' + uniqueSuffix + "." + ext)
        }
})

const upload = multer({ storage: storage })

module.exports = upload;