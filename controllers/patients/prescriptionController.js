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

    const prescriber = (prescribed_by || "").trim() || "Dr. Nilesh Choudhari";

    if (
      !diagnosis ||
      !prescriber ||
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
        doctor_name: prescriber,
        diagnosis,
        notes,
        follow_up_date,
      });
    } else {
      // Update existing visit with new information
      visit.symptoms_or_reason = symptoms_or_reason;
      visit.doctor_name = prescriber;
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
      prescribed_by: prescriber,
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

// Update prescription (status and details)
exports.updatePrescriptionStatus = async (req, res, next) => {
  try {
    const prescriptionId = req.params.id;
    const {
      prescription_status,
      medications,
      diagnosis,
      prescribed_by,
      follow_up_date,
      notes,
      visit_date,
      symptoms_or_reason,
    } = req.body;

    const prescription = await Prescription.findById(prescriptionId).populate("visit");
    if (!prescription) {
      return responseHandler.generateError(res, "Prescription not found", null);
    }

    // Validate required fields
    if (diagnosis !== undefined && !diagnosis?.trim()) {
      return responseHandler.generateError(res, "Diagnosis is required", null);
    }

    if (prescribed_by !== undefined && !prescribed_by?.trim()) {
      return responseHandler.generateError(res, "Prescribed by is required", null);
    }

    if (medications !== undefined && (!Array.isArray(medications) || medications.length === 0)) {
      return responseHandler.generateError(res, "At least one medication is required", null);
    }

    // Update prescription fields
    if (prescription_status !== undefined) {
      prescription.prescription_status = prescription_status;
    }

    if (medications && Array.isArray(medications)) {
      prescription.medications = medications;
    }

    if (diagnosis !== undefined) {
      prescription.diagnosis = diagnosis;
    }

    if (prescribed_by !== undefined) {
      prescription.prescribed_by = prescribed_by;
    }

    if (follow_up_date !== undefined) {
      prescription.follow_up_date = follow_up_date ? new Date(follow_up_date) : null;
    }

    if (notes !== undefined) {
      prescription.notes = notes || "";
    }

    if (visit_date !== undefined) {
      prescription.visit_date = visit_date ? new Date(visit_date) : prescription.visit_date;
    }

    await prescription.save();

    // Keep visit details in sync where applicable
    if (prescription.visit) {
      if (diagnosis !== undefined) prescription.visit.diagnosis = diagnosis;
      if (prescribed_by !== undefined) prescription.visit.doctor_name = prescribed_by;
      if (follow_up_date !== undefined) {
        prescription.visit.follow_up_date = follow_up_date ? new Date(follow_up_date) : null;
      }
      if (notes !== undefined) prescription.visit.notes = notes || "";
      if (visit_date !== undefined) {
        prescription.visit.visit_date = visit_date ? new Date(visit_date) : prescription.visit.visit_date;
      }
      if (symptoms_or_reason !== undefined) {
        prescription.visit.symptoms_or_reason = symptoms_or_reason;
      }
      await prescription.visit.save();
    }

    const refreshed = await Prescription.findById(prescriptionId)
      .populate("visit")
      .populate("patient", "name unique_patient_id first_name last_name phone_number email");

    responseHandler.generateSuccess(res, "Prescription updated successfully", refreshed);
  } catch (error) {
    responseHandler.generateError(res, "Failed to update prescription", error);
    next(error);
  }
};
