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
      required: true,
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
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
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
      required: true,
    },
    customHealthIssue: {
      type: String,
      default: "",
      required: false,
    },
    blood_group: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
