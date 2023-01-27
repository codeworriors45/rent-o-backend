const { Router } = require("express");
const {
  getUserAddress,
  getUserAddresses,
  createUserAddress,
  createUserProfileAddress,
  updateUserAddress,
  deleteUserAddress,
  updateUserProfileAddress
} = require("../../controllers/v3/users/userAddresses.controller");
const { isAdmin } = require("../../middlewares/isAdmin");
const { validateJwt } = require("../../middlewares/validateJwt");
const { validateUser } = require("../../middlewares/validateUser");

const router = Router();

router.use(validateJwt);

router.get('/', getUserAddresses);
router.get("/:id", getUserAddress);
router.post("/", validateJwt, isAdmin, createUserAddress);
router.post("/profile-address", validateJwt, validateUser, createUserProfileAddress);
router.put("/profile-address/:id", validateJwt, validateUser, updateUserProfileAddress);
router.put("/:id", validateJwt, isAdmin, updateUserAddress);
router.delete("/:id", validateUser, deleteUserAddress);
module.exports = router;
