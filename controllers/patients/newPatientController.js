const joi = require("joi");
const responseHandler = require("../../utils/response-handler");
const newPatientModel = require("../../models/patientModel/newPatientModel");
exports.registerPatient = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      gender,
      age,
      location,
      address,
      email,
      phone_number,
      health_issues_initial,
      customHealthIssue,
      blood_group,
      country,
      state,
      city,
    } = req.body;

    // Validate healthIssues array
    const validationSchema = joi.object().keys({
      first_name: joi.string().required(),
      last_name: joi.string().required(),
      gender: joi.string().required(),
      age: joi.number().required(),
      location: joi.string().required(),
      address: joi.string().allow("").optional(),
      country: joi.string().allow("").optional(),
      state: joi.string().allow("").optional(),
      city: joi.string().allow("").optional(),
      phone_number: joi
        .alternatives()
        .try(joi.string().allow(""), joi.number())
        .optional(),
      health_issues_initial: joi
        .array()
        .items(
          joi.object().keys({
            label: joi.string().required(),
            group: joi.string().required(),
          }),
        )
        .optional(),
      customHealthIssue: joi.string().allow("").optional(),
      blood_group: joi.string().allow("").optional(),
    });

    const result = validationSchema.validate(req.body);
    if (result.error) {
      return responseHandler.generateError(
        res,
        "Validation failed",
        result.error,
      );
    }

    const normalizedHealthIssues = Array.isArray(health_issues_initial)
      ? health_issues_initial
      : [];
    // Check if the phone number already exists
    // const existingPatient = await newPatientModel.findOne({ phone_number });
    // if (existingPatient) {
    //   return responseHandler.generateError(
    //     res,
    //     "This phone number is already associated with a registered patient."
    //   );
    // }

    // Generate a unique patient ID
    const unique_patient_id = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;

    const isOtherHealthIssueSelected = normalizedHealthIssues.some(
      (issue) => issue.label === "Other",
    );

    // Create new patient document
    const newPatient = await newPatientModel.create({
      unique_patient_id,
      first_name,
      last_name,
      gender,
      age,
      location,
      address,
      country,
      state,
      city,
      phone_number,
      email,
      health_issues_initial: normalizedHealthIssues,
      customHealthIssue: isOtherHealthIssueSelected ? customHealthIssue : "",
      blood_group,
    });

    responseHandler.generateSuccess(
      res,
      "Registered successfully",
      { _id: newPatient._id },
      201,
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [allPatients, total] = await Promise.all([
      newPatientModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      newPatientModel.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    responseHandler.generateSuccess(res, "Patients fetched successfully", {
      currentPage: page,
      totalPages,
      totalRecords: total,
      recordsPerPage: limit,
      allPatients,
    });
  } catch (err) {
    responseHandler.generateError(res, "Error fetching patients", err);
    next(err);
  }
};

exports.getPatient = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const patient = await newPatientModel.findOne({
      _id: patientId,
    });

    if (!patient) {
      return responseHandler.generateError(res, "Patient not found", null, 404);
    }

    responseHandler.generateSuccess(
      res,
      "Patient fetched successfully",
      patient,
    );
  } catch (err) {
    responseHandler.generateError(res, "Error fetching patient", err, 500);
    next(err);
  }
};

exports.updatePatient = async (req, res, next) => {
  const updatedData = req.body;

  try {
    await newPatientModel.updateOne(
      { _id: req.params.id },
      { $set: updatedData },
    );

    responseHandler.generateSuccess(
      res,
      "Patient updated successfully",
      null,
      200,
    );
  } catch (err) {
    responseHandler.generateError(res, "Error updating patient", err, 500);
    next(err);
  }
};

// Delete patient by ID
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await newPatientModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json({
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting patient:", error);

    return res.status(500).json({
      message: "Error deleting patient",
      error: error.message,
    });
  }
};
