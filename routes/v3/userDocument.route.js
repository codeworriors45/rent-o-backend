const { Router } = require("express");
const userDocumentController = require('../../controllers/v3/userDocument/userDocument.controller')

const router = Router();

router.route("/")
    .get(userDocumentController.index)
    .post(userDocumentController.store)

router.route("/:docId")
    .put(userDocumentController.update)
    .delete(userDocumentController.destroy)

module.exports = router;