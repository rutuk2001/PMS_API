const router = require("../index");
const authController = require("../controllers/auth");
const userController = require("../controllers/userController");
const PatientController = require("../controllers/patients/newPatientController");
const { jWtAuth } = require("../middleware/tokenAuth");
router.post("/registerUser", authController.registerUser);
router.post("/userLogin", authController.login);
router.get("/getUserData/:id", jWtAuth, userController.userData);
router.get("/getUser/:id", jWtAuth, userController.user);
router.post("/createNewPatient", jWtAuth, PatientController.registerPatient);
router.get("/getAllPatients", jWtAuth, PatientController.getAllPatients);
router.get("/getPatient/:id", jWtAuth, PatientController.getPatient);
router.put("/updatePatient/:id", jWtAuth, PatientController.updatePatient);
router.delete(
  "/deletePatient/:patient",
  jWtAuth,
  PatientController.deletePatient
);
module.exports = router;
