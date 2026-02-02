const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    unique_patient_id: {
      type: String,
      required: true,
      unique: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    phone_number: {
      type: Number,
      required: false,
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    health_issues_initial: {
      type: [
        {
          label: String,
          group: String,
        },
      ],
      required: false,
    },
    customHealthIssue: {
      type: String,
      default: "",
      required: false,
    },
    blood_group: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
