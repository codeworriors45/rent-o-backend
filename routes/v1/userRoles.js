const { Router } = require("express");
const {
  getUserRole,
  getUserRoles,
  createUserRole,
  updateUserRole,
  deleteUserRole
} = require("../../controllers/v1/userRoles");
const { validateJwt } = require("../../middlewares/validateJwt");
const { validateUser } = require("../../middlewares/validateUser");

const router = Router();

router.use(validateJwt);

router.get('/', getUserRoles);
router.get("/:id", getUserRole);
router.post("/", validateUser, createUserRole);
router.put("/:id", validateUser, updateUserRole);
router.delete("/:id", validateUser, deleteUserRole);
module.exports = router;
