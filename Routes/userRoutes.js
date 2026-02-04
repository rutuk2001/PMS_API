const router = require("../index");
const authController = require("../controllers/auth");
const userController = require("../controllers/userController");
const PatientController = require("../controllers/patients/newPatientController");
const PatientVisitController = require("../controllers/patients/visitedHistoryController");
const { jWtAuth } = require("../middleware/tokenAuth");
const PatientPrescriptionController = require("../controllers/patients/prescriptionController");

router.post("/registerUser", authController.registerUser);
router.post("/userLogin", authController.login);
router.get("/getUserData/:id", jWtAuth, userController.userData);
router.get("/getUser/:id", jWtAuth, userController.user);
router.post("/createNewPatient", jWtAuth, PatientController.registerPatient);
router.get("/getAllPatients", jWtAuth, PatientController.getAllPatients);
router.get("/getPatient/:id", jWtAuth, PatientController.getPatient);
router.put("/updatePatient/:id", jWtAuth, PatientController.updatePatient);
router.delete("/deletePatient/:id", jWtAuth, PatientController.deletePatient);

// Visit History Routes
router.post("/api/visits", jWtAuth, PatientVisitController.logVisit);
router.get(
  "/api/history/:id",
  jWtAuth,
  PatientVisitController.getVisitHistoryByPatient,
);
router.get("/api/visits/:id", jWtAuth, PatientVisitController.getVisitById);
router.put("/api/visits/:id", jWtAuth, PatientVisitController.updateVisit);

// Prescription Routes
router.put(
  "/visits/:id/prescription",
  jWtAuth,
  PatientPrescriptionController.addPrescriptionToVisit,
);
router.get(
  "/api/prescriptions/:id",
  jWtAuth,
  PatientPrescriptionController.getPrescriptionById,
);
router.put(
  "/api/prescriptions/:id",
  jWtAuth,
  PatientPrescriptionController.updatePrescriptionStatus,
);

module.exports = router;
