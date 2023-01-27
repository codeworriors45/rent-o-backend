const db = require("../../../models");
const { helloSignHelpers, helloSignKeys } = require("./helloSignHelpers");
const Validator = require("validatorjs");

const hellosign = require("hellosign-sdk")({
  key: helloSignKeys.HELLOSIGN_KEY,
});

/**
 * Creates a full name for hellosign api signer
 * @param {string} firstname
 * @param {string|undefined} lastname
 * @returns {string}
 */
const joinFirstAndLastname = (firstname, lastname) => {
  return `${firstname} ${lastname ?? " "}`.trim();
};

const helloApiCallback = async (req, res) => {
  try {
    const data = JSON.parse(req.body.json);
    // signer can be for:
    // buyer + seller
    // seller only
    const signatureRequestId = data?.signature_request?.signature_request_id;
    const signatures = data?.signature_request?.signatures;

    // Event fires after an individual signer has signed
    if (data?.event?.event_type === "signature_request_signed") {
      console.log("A user has signed");
      // buyer seller signing process
      if (signatures.length === 2) {
        const buyerSellerContract = await db.BuyerSellerContract.findOne({
          where: {
            signatureRequestId: signatureRequestId,
          },
        });

        // check to see if buyer seller contract exists
        if (buyerSellerContract) {
          console.log(signatures);

          buyerSellerContract.buyerSignStatus =
            signatures[0].status_code === "signed";

          buyerSellerContract.sellerSignStatus =
            signatures[1].status_code === "signed";

          await buyerSellerContract.save();

          console.log("Buyer Seller Contract Found and Saved");
        }
      }
    }
    // Event fires after the signing process is completely done by all parties
    if (data?.event?.event_type === "signature_request_all_signed") {
      const signature = data?.signature_request?.signatures[0];
      console.log(signature);
      // One signer implies the process is for sellers only
      if (signatures.length === 1) {
        if (data?.signature_request?.is_complete === true) {
          const contract = await db.SellerPropertyContract.findOne({
            where: {
              signingId: signatures[0]?.signature_id,
            },
          });

          if (contract) {
            contract.isSigned = true;

            await contract.save();

            console.log(`Updated DB`);
          } else {
            console.log("Seller Signing Record not found");
          }
        }

        // retrieve document and sign it
      } else {
        // Buyer Seller: Both Parties Signed
        const buyerSellerContract = await db.BuyerSellerContract.findOne({
          where: {
            signatureRequestId: signatureRequestId,
          },
        });

        // check to see if buyer seller contract exists
        if (buyerSellerContract) {
          buyerSellerContract.buyerSignStatus = true;

          buyerSellerContract.sellerSignStatus = true;

          await buyerSellerContract.save();

          console.log("Buyer Seller Contract Completed Fully and Saved in DB");
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  return res.status(200).send("Hello API Event Received.");
};

const getSigningProcessDetails = async (req, res, body) => {
  const id = req.params.id;
  try {
    const response = await hellosign.signatureRequest.get(id);
    return apiResponse.success(res, response);
  } catch (error) {
    console.log(error);
    return apiResponse.success(res, error);
  }
};

const createSellerPropertyContract = async (req, res) => {
  const { id, type } = req.user;

  try {
    // retrieve user from id
    const user = await db.User.findOne({
      where: {
        id: id,
      },
    });

    const opts = {
      test_mode: helloSignKeys.MODE,
      clientId: helloSignKeys.CLIENT_ID,
      template_id: helloSignKeys.SELLER_TEMPLATE_ID,
      signers: [
        {
          email_address: user.email,
          name: user.firstName + ` ${user?.lastName ?? ""}`,
          role: "Seller",
        },
      ],
    };

    // generate signing request
    const signRequest =
      await hellosign.signatureRequest.createEmbeddedWithTemplate(opts);

    // Identifier for the entire document
    const signatureRequestId =
      signRequest?.signature_request?.signature_request_id;

    // Identifier for a particular signee
    const signatureId =
      signRequest?.signature_request?.signatures?.[0]?.signature_id;

    // storing information in db
    await db.SellerPropertyContract.create({
      sellerId: id,
      signatureRequestId: signatureRequestId,
      signingId: signatureId,
      metaData: signRequest ?? {},
    });

    // get signed url
    const embeddedSignUrl = await hellosign.embedded.getSignUrl(signatureId);
    return apiResponse.success(res, embeddedSignUrl);
  } catch (error) {
    console.error(error);
    return apiResponse.error(
      res,
      httpStatusCode.UNAUTHORIZED,
      error?.message ?? "An unexpected error occurred"
    );
  }
};

const createSign = async (req, res, next) => {
  const { email, name, role } = req.body;
  const opts = {
    test_mode: helloSignKeys.MODE,
    clientId: helloSignKeys.CLIENT_ID,
    template_id: helloSignKeys.SELLER_TEMPLATE_ID,
    signers: [
      {
        email_address: email,
        name: name,
        role: role,
      },
    ],
  };

  try {
    const signRequest =
      await hellosign.signatureRequest.createEmbeddedWithTemplate(opts);

    /**
     * signature_id for a user is unique and persistent,
     * using that we can generate signedUrls, and download documents
     *
     * TODO:
     * store signRequest.signature_request.signatures[0].signature_id in DB
     */

    const embeddedSignUrl = await hellosign.embedded.getSignUrl(
      signRequest.signature_request.signatures[0].signature_id
    );
    res.send(embeddedSignUrl);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
};

const signedDoc = async (req, res, next) => {
  const { id } = req.body;
  // https://www.npmjs.com/package/hellosign-sdk#:~:text=Download%20files%20from%20a%20signature%20request
  hellosign.signatureRequest.download(id, { file_type: "pdf" }, (err, data) => {
    if (err) {
      res.send(err);
    }
    // piping bytes to response for download
    data.pipe(res);
  });
};

const sellerBuyerContract = async (req, res, next) => {
  // validate body
  const rules = {
    closingDate: "required|string",
    termsMonths: "required|integer",
    rentPayment: "required",
    // rentSavings:
    terms: "string",
    includedItems: "string",
  };

  const validation = new Validator(req.body, rules);
  if (validation.fails()) {
    return apiResponse.errorWithData(
      res,
      validation.errors.all(),
      httpStatusCode.UNPROCESSABLE,
      "Validation Error"
    );
  }
  // retrieve property id
  const propertyId = req.params.id;
  // retrieve buyer info from token
  const { id, type } = req.user;
  const buyerId = id;
  const buyer = await db.User.findOne({
    where: { id: id },
  });

  // Separate Issue:
  // _______________
  // Check whether offer exists
  // const offer = db.Offer.findOne({
  //   where: {
  //     propertyId: propertyId,
  //     userId: buyerId,
  //   },
  // });

  // // return if => offer already placed against property
  // if (offer)
  //   return apiResponse.error(
  //     res,
  //     httpStatusCode.BAD_REQUEST,
  //     "You already placed an offer for this property"
  //   );

  // with property id retrieve seller information
  const property = await db.Property.findOne({
    where: {
      id: propertyId,
    },
    include: [
      {
        model: db.PropertyAddress,
        attributes: ["street", "zipCode", "apt"],
        include: [
          {
            model: db.City,
            attributes: ["name"],
            include: [
              {
                model: db.Province,
                attributes: ["name"],
              },
            ],
          },
        ],
      },
      {
        model: db.PropertyFeature,
        attributes: ["id"],
        include: [
          {
            model: db.Feature,
            attributes: ["name", "interior"],
          },
        ],
      },
    ],
  });

  // return if => property not found
  if (!property)
    return apiResponse.error(
      res,
      httpStatusCode.NOT_FOUND,
      "Property doesn't exist"
    );

  // collect sender email
  const sellerId = property?.userId;
  const seller = await db.User.findOne({
    where: {
      id: sellerId,
    },
  });

  const { closingDate, termsMonths, rentPayment, rentSavings } = req.body;

  // create a signing document against a property
  const opts = {
    test_mode: helloSignKeys.MODE,
    clientId: helloSignKeys.CLIENT_ID,
    template_id: helloSignKeys.BUYER_SELLER_TEMPLATE_ID,
    signers: [
      {
        email_address: buyer.email,
        name: joinFirstAndLastname(buyer.firstName, buyer.lastName),
        role: "Buyer",
        order: 0,
      },
      {
        email_address: seller.email,
        name: joinFirstAndLastname(seller.firstName, seller.lastName),
        role: "Seller",
        order: 1,
      },
    ],
    ccs: [
      {
        email_address: "admin@algosolver.com",
        role_name: "Viewer",
      },
    ],
    metadata: {
      propertyId: propertyId,
      sellerId: seller.id,
      buyerId: buyer.id,
    },
    custom_fields: helloSignHelpers.completeBuyerSellerContractAutoGeneration(
      property,
      closingDate ?? "2021-11-19",
      termsMonths ?? 1,
      rentPayment,
      rentSavings
    ),
  };

  try {
    const buyerSellerSigningContract =
      await hellosign.signatureRequest.createEmbeddedWithTemplate(opts);

    // collect signature request id
    const signatureRequestId =
      buyerSellerSigningContract.signature_request.signature_request_id;

    const signatures = buyerSellerSigningContract.signature_request.signatures;
    const buyerSignature = signatures[0];
    const sellerSignature = signatures[1];

    // collect buyer signature request id
    const buyerSignatureId = buyerSignature.signature_id;

    // collect seller signature request id
    const sellerSignatureId = sellerSignature.signature_id;

    //save to BuyerSellerContractModel
    const storedContract = await db.BuyerSellerContract.create({
      signatureRequestId: signatureRequestId,
      sellerId: sellerId,
      buyerId: buyerId,
      propertyId: propertyId,
      sellerSignId: sellerSignatureId,
      sellerSignStatus: false,
      buyerSignStatus: false,
      buyerSignId: buyerSignatureId,
      metaData: buyerSellerSigningContract.signature_request,
    });

    // Retrieve signing url for buyer ->
    const buyerIframeSignedUrl = await hellosign.embedded.getSignUrl(
      buyerSignatureId
    );

    delete buyerIframeSignedUrl?.resHeaders;
    // send signing url for buyer
    return apiResponse.success(res, {
      ...buyerIframeSignedUrl,
      contractId: storedContract.id,
    });
  } catch (error) {
    console.log(error);
    return apiResponse.error(
      res,
      httpStatusCode.UNAUTHORIZED,
      error?.message ?? "Something unexpected happened"
    );
  }
};

const getSignedUrl = async (req, res) => {
  const signingId = req.params.signingId;
  try {
    const signedUrl = await hellosign.embedded.getSignUrl(signingId);
    return apiResponse.success(res, signedUrl);
  } catch (error) {
    console.log(error);
    return apiResponse.error(res, error);
  }
};

const getContractsFromBuyers = async (req, res) => {
  const { id } = req.user;
  const allSigns = await db.BuyerSellerContract.findAll({
    where: {
      sellerId: id,
      buyerSignStatus: true,
    },
    attributes: ["id", "sellerSignId", "sellerSignStatus", "buyerSignStatus"],
    include: [
      {
        model: db.Property,
        attributes: ["id", "name"],
      },
      {
        model: db.User,
        attributes: ["id", "email", "image"],
        as: "buyer",
      },
      {
        model: db.Offer,
        required: true,
      },
    ],
  });
  res.send(allSigns);
};

const testBuyerSellerContractGeneration = async (req, res) => {
  console.log(req.params.propertyId);
  const property = await db.Property.findOne({
    where: {
      id: req.params.propertyId,
    },
    include: [
      {
        model: db.PropertyAddress,
        attributes: ["street", "zipCode", "apt"],
        include: [
          {
            model: db.City,
            attributes: ["name"],
            include: [
              {
                model: db.Province,
                attributes: ["name"],
              },
            ],
          },
        ],
      },
      {
        model: db.PropertyFeature,
        attributes: ["id"],
        include: [
          {
            model: db.Feature,
            attributes: ["name", "interior"],
          },
        ],
      },
    ],
  });

  return res.send({
    main: helloSignHelpers.completeBuyerSellerContractAutoGeneration(
      property,
      "2021-11-19",
      8,
      1000,
      200
    ),
    property,
  });
};

module.exports = {
  createSign,
  getSigningProcessDetails,
  signedDoc,
  helloApiCallback,
  sellerBuyerContract,
  getSignedUrl,
  getContractsFromBuyers,
  createSellerPropertyContract,
  testBuyerSellerContractGeneration,
};
