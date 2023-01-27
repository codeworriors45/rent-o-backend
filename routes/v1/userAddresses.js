const { Router } = require("express");
const {
  getUserAddress,
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress
} = require("../../controllers/v1/userAddresses");
const { validateJwt } = require("../../middlewares/validateJwt");
const { validateUser } = require("../../middlewares/validateUser");

const router = Router();

router.use(validateJwt);

router.get('/', getUserAddresses);
router.get("/:id", getUserAddress);
router.post("/", validateUser, createUserAddress);
router.put("/:id", validateUser, updateUserAddress);
router.delete("/:id", validateUser, deleteUserAddress);
module.exports = router;
