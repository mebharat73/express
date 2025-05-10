import Payment from "../models/Payment.js";

const createPayment = async (data) => {
  return await Payment.create(data);
};

const updatePayment = async (id, data) => {
  return await Payment.findByIdAndUpdate(id, data);
};

export default { createPayment, updatePayment };
