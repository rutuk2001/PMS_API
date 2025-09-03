const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    visit_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    symptoms_or_reason: {
      type: String,
      required: true,
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },
    doctor_name: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
    },
    follow_up_date: {
      type: Date,
    },
    notes: String,
    status: {
      type: String,
      enum: ['completed', 'pending', 'cancelled'],
      default: 'completed'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visit", visitSchema);
