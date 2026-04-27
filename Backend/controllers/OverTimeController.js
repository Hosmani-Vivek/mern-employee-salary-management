import Overtime from "../models/OvertimeModel.js";
import DataPegawai from "../models/DataPegawaiModel.js";
import { Op } from "sequelize";

// ─────────────────────────────────────────────────────────────────
// POST /api/overtime
// ─────────────────────────────────────────────────────────────────
export const createOvertime = async (req, res) => {
  const { id_pegawai, date, hours, reason } = req.body;

  // 1. All fields required
  if (!id_pegawai || !date || !hours || !reason) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // 2. Hours must be between 1 and 6
  const h = Number(hours);
  if (isNaN(h) || h < 1 || h > 6) {
    return res
      .status(400)
      .json({ message: "Overtime hours must be between 1 and 6." });
  }

  // 3. Date rules
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  if (isNaN(inputDate.getTime())) {
    return res.status(400).json({ message: "Invalid date format." });
  }
  if (inputDate > today) {
    return res.status(400).json({ message: "Date cannot be in the future." });
  }
  const diffDays = (today - inputDate) / (1000 * 60 * 60 * 24);
  if (diffDays > 7) {
    return res
      .status(400)
      .json({ message: "Cannot log overtime older than 7 days." });
  }

  // 4. Reason must be at least 10 characters
  if (reason.trim().length < 10) {
    return res
      .status(400)
      .json({ message: "Reason must be at least 10 characters." });
  }

  //   // 5. Employee must exist in data_pegawai
  //   const employee = await DataPegawai.findOne({ where: { nama_pegawai } });
  //   console.log(employee);
  //   console.log(nama_pegawai);
  //   if (!employee) {
  //     return res.status(404).json({ message: "Employee not found." });
  //   }

  // 6. No duplicate entry: same employee + same date
  //   const duplicate = await Overtime.findOne({ where: { nama_pegawai, date } });
  //   if (duplicate) {
  //     return res.status(409).json({
  //       message:
  //         "Overtime for this employee on this date has already been logged.",
  //     });
  //   }

  // 7. Monthly cap: cannot exceed 60 hours total
  const monthStart = date.slice(0, 7) + "-01";

  const result = await Overtime.findOne({
    attributes: [
      [
        Overtime.sequelize.fn(
          "COALESCE",
          Overtime.sequelize.fn("SUM", Overtime.sequelize.col("hours")),
          0,
        ),
        "total",
      ],
    ],
    where: {
      id_pegawai,
      date: { [Op.gte]: monthStart },
    },
    raw: true,
  });

  const monthlyTotal = Number(result?.total) || 0;
  if (monthlyTotal + h > 60) {
    return res.status(400).json({
      message: `Monthly overtime cap exceeded. Current total: ${monthlyTotal} hrs. Remaining: ${60 - monthlyTotal} hrs.`,
    });
  }

  // 8. Save
  try {
    await Overtime.create({
      id_pegawai,
      date,
      hours: h,
      reason: reason.trim(),
    });
    return res
      .status(201)
      .json({ message: "Overtime entry submitted successfully." });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message:
          "Overtime for this employee on this date has already been logged.",
      });
    }
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/overtime
// ─────────────────────────────────────────────────────────────────
export const getOvertime = async (req, res) => {
  try {
    const data = await Overtime.findAll({ order: [["date", "DESC"]] });
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// DELETE /api/overtime/:id
// ─────────────────────────────────────────────────────────────────
export const deleteOvertime = async (req, res) => {
  try {
    const deleted = await Overtime.destroy({ where: { id: req.params.id } });
    if (!deleted)
      return res.status(404).json({ message: "Overtime entry not found." });
    return res
      .status(200)
      .json({ message: "Overtime entry deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};
