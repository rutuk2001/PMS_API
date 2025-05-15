const userModel = require("../models/users");
const responseHandler = require("../utils/response-handler");

require("dotenv").config();

exports.userData = async (req, res, next) => {
  try {
    let userId = req.params.id;
    let totalSlots = await booking.find({ user_id: userId });
    res.json(totalSlots);
  } catch {
    res.json(Error);
  }
};

exports.user = async (req, res, next) => {
  try {
    let userId = req.params.id;
    let User = await userModel.find({ _id: userId });
    res.json(User);
  } catch {
    res.json(Error);
  }
};
