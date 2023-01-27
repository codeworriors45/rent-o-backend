const { Router } = require("express");
const sellerSignController = require("../../controllers/v3/docSign/sellerSign.controller");
const { validateJwt } = require("../../middlewares/validateJwt");
const multer = require("multer");
const upload = multer();

const router = Router();

// Explanation:
// https://www.cronj.com/blog/callback-for-hellosign-api-in-nodejs/
router.post(
  "/hello-api-callback",
  upload.array(),
  sellerSignController.helloApiCallback
);

router.post(
  "/seller-contract",
  validateJwt,
  sellerSignController.createSellerPropertyContract
);

router.get("/get-signed-url/:signingId", sellerSignController.getSignedUrl);
router.get(
  "/contracts-for-seller",
  validateJwt,
  sellerSignController.getContractsFromBuyers
);

router.get(
  "/seller-contract/:id",
  sellerSignController.getSigningProcessDetails
);
router.post("/seller-sign", sellerSignController.createSign);
router.post("/seller-doc", sellerSignController.signedDoc);

/**
 * FOR DEV TESTING
 * */
router.post(
  "/buyer-property/:propertyId",
  sellerSignController.testBuyerSellerContractGeneration
);

router.post(
  "/buyer-seller-contract/:id",
  validateJwt,
  sellerSignController.sellerBuyerContract
);

module.exports = router;
