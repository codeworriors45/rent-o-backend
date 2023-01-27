const { Router } = require("express");
const {
    index,
    show,
    store,
    update,
    destroy,
} = require("../../controllers/v2/feature/feature.controller");
const { validateJwt } = require("../../middlewares/validateJwt");
const { validateUser } = require("../../middlewares/validateUser");
const { isAdmin } = require("../../middlewares/isAdmin");

const router = Router();

router.use(validateJwt);

router.get("/", index);
router.get("/:featureId", show);
router.post("/", isAdmin, store);
router.put("/:featureId",isAdmin, update);
router.delete("/:featureId", isAdmin, destroy);

module.exports = router;