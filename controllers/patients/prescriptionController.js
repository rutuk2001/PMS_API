const Prescription = require("../../models/patientPrescription/patientPrescription");
const VisitHistory = require("../../models/patientVisitHistory/visitedHistory");
const responseHandler = require("../../utils/response-handler");

exports.addPrescriptionToVisit = async (req, res, next) => {
  try {
    const {
      patient,
      diagnosis,
      prescribed_by,
      medications,
      follow_up_date,
      notes,
      visit_date,
      symptoms_or_reason,
    } = req.body;

    if (
      !diagnosis ||
      !prescribed_by ||
      !Array.isArray(medications) ||
      !symptoms_or_reason
    ) {
      return responseHandler.generateError(
        res,
        "Missing required fields: diagnosis, prescribed_by, medications, or symptoms"
      );
    }

    // 1. Check if visit already exists for the patient on this date
    let visit = await VisitHistory.findOne({
      patient: patient,
      visit_date: new Date(visit_date),
    });

    // 2. If not, create a new visit
    if (!visit) {
      visit = await VisitHistory.create({
        patient,
        visit_date: new Date(visit_date),
        symptoms_or_reason,
        doctor_name: prescribed_by,
        diagnosis,
        notes,
        follow_up_date,
      });
    } else {
      // Update existing visit with new information
      visit.symptoms_or_reason = symptoms_or_reason;
      visit.doctor_name = prescribed_by;
      visit.diagnosis = diagnosis;
      visit.notes = notes;
      visit.follow_up_date = follow_up_date;
      await visit.save();
    }

    // 3. Create a prescription
    const prescription = await Prescription.create({
      patient,
      visit: visit._id,
      visit_date: new Date(visit_date),
      diagnosis,
      prescribed_by,
      medications,
      follow_up_date,
      notes,
    });

    // 4. Link prescription to visit
    visit.prescription = prescription._id;
    await visit.save();

    // 5. Return populated visit with prescription details
    const populatedVisit = await VisitHistory.findById(visit._id)
      .populate({
        path: 'prescription',
        populate: {
          path: 'medications'
        }
      })
      .populate('patient', 'healthIssues customHealthIssue symptoms_or_reason unique_patient_id name');

    responseHandler.generateSuccess(
      res,
      "Prescription added and visit saved successfully",
      populatedVisit
    );
  } catch (error) {
    responseHandler.generateError(res, "Failed to add prescription", error);
    next(error);
  }
};

// Get prescription details by prescription ID
exports.getPrescriptionById = async (req, res, next) => {
  try {
    const prescriptionId = req.params.id;
    
    const prescription = await Prescription.findById(prescriptionId)
      .populate('patient', 'name unique_patient_id')
      .populate('visit', 'visit_date symptoms_or_reason');

    if (!prescription) {
      return responseHandler.generateError(res, "Prescription not found", null);
    }

    responseHandler.generateSuccess(res, "Prescription fetched successfully", prescription);
  } catch (error) {
    responseHandler.generateError(res, "Failed to fetch prescription", error);
    next(error);
  }
};

// Update prescription status
exports.updatePrescriptionStatus = async (req, res, next) => {
  try {
    const prescriptionId = req.params.id;
    const { prescription_status, medications } = req.body;

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return responseHandler.generateError(res, "Prescription not found", null);
    }

    if (prescription_status) {
      prescription.prescription_status = prescription_status;
    }

    if (medications && Array.isArray(medications)) {
      prescription.medications = medications;
    }

    await prescription.save();

    responseHandler.generateSuccess(res, "Prescription updated successfully", prescription);
  } catch (error) {
    responseHandler.generateError(res, "Failed to update prescription", error);
    next(error);
  }
};
