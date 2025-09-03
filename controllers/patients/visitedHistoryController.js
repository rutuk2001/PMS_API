const VisitHistory = require("../../models/patientVisitHistory/visitedHistory");
const responseHandler = require("../../utils/response-handler");

exports.logVisit = async (req, res, next) => {
  try {
    const { patient, symptoms_or_reason, doctor_name, notes, visit_date } = req.body;

    if (!patient || !symptoms_or_reason || !doctor_name) {
      return responseHandler.generateError(
        res,
        "Missing required fields: patient, symptoms_or_reason, or doctor_name"
      );
    }

    const visit = await VisitHistory.create({
      patient,
      symptoms_or_reason,
      doctor_name,
      notes,
      visit_date: visit_date || new Date(),
    });

    responseHandler.generateSuccess(res, "Visit logged successfully", visit);
  } catch (error) {
    responseHandler.generateError(res, "Failed to log visit", error);
    next(error);
  }
};

// Get paginated visits for a patient with prescription details
exports.getVisitHistoryByPatient = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [visits, total] = await Promise.all([
      VisitHistory.find({ patient: patientId })
        .sort({ visit_date: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'prescription',
          populate: {
            path: 'medications'
          }
        })
        .populate(
          "patient",
          "healthIssues customHealthIssue symptoms_or_reason unique_patient_id name"
        ),
      VisitHistory.countDocuments({ patient: patientId }),
    ]);

    const totalPages = Math.ceil(total / limit);

    responseHandler.generateSuccess(res, "Visit history fetched successfully", {
      currentPage: page,
      totalPages,
      totalRecords: total,
      recordsPerPage: limit,
      visits,
    });
  } catch (error) {
    responseHandler.generateError(res, "Failed to fetch visit history", error);
    next(error);
  }
};

// Get a specific visit with full details
exports.getVisitById = async (req, res, next) => {
  try {
    const visitId = req.params.id;
    
    const visit = await VisitHistory.findById(visitId)
      .populate({
        path: 'prescription',
        populate: {
          path: 'medications'
        }
      })
      .populate('patient', 'name unique_patient_id healthIssues customHealthIssue');

    if (!visit) {
      return responseHandler.generateError(res, "Visit not found", null);
    }

    responseHandler.generateSuccess(res, "Visit fetched successfully", visit);
  } catch (error) {
    responseHandler.generateError(res, "Failed to fetch visit", error);
    next(error);
  }
};

// Update visit details
exports.updateVisit = async (req, res, next) => {
  try {
    const visitId = req.params.id;
    const updateData = req.body;

    const visit = await VisitHistory.findByIdAndUpdate(
      visitId,
      updateData,
      { new: true, runValidators: true }
    ).populate('prescription');

    if (!visit) {
      return responseHandler.generateError(res, "Visit not found", null);
    }

    responseHandler.generateSuccess(res, "Visit updated successfully", visit);
  } catch (error) {
    responseHandler.generateError(res, "Failed to update visit", error);
    next(error);
  }
};
