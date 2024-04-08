const express = require("express");
const { authMiddleware } = require("../middleware/auth-middleware");
const { asyncRouteHandler } = require("../utils/routerUtils");
const { verify } = require("../controllers/controller");
// const { dashboard, addInstitute, getInstitute, deleteInstitute } = require('../controllers/admin-controller');
const router = express.Router();
router.use(authMiddleware());
router.get("/verify", asyncRouteHandler(verify));
module.exports = router;
