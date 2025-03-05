const asyncHandler = require("express-async-handler");
const Result = require("../models/result.model.js");
const Event = require("../models/event.model.js");
const Class = require("../models/class.model.js");
const sendMail = require("../helpers/mail.helper.js");
const User = require("../models/user.model.js");

// Get result by Event ID
const getResultByEventId = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventExists = await Event.findById(eventId);
    
    if (!eventExists) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const result = await Result.findOne({ eventId }).populate("eventId").populate("result.classId");

    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found for this event" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Get a single result by ID
const getResultById = asyncHandler(async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate("eventId").populate("result.classId");
    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Create a new result
const createResult = asyncHandler(async (req, res) => {
  try {
    const { eventId, result } = req.body;
    console.log({ eventId, result})
    
    const eventExists = await Event.findById(eventId);
    if (!eventExists) {
      return res.status(400).json({ success: false, message: "Event not found" });
    }

    for (const item of result) {
      const classExists = await Class.findById(item._id);
      if (!classExists) {
        return res.status(400).json({ success: false, message: `Class not found for ID: ${item._id}` });
      }
    }
    const existingResult = await Result.findOne({ eventId });
    if (existingResult) {
      return res.status(400).json({ success: false, message: "Result for this event already exists" });
    }

    const resultObj  = result.map((item) => {
      return {
        classId: item._id,
        position: result.indexOf(item) + 1,
      };
    });

    const currentYear = new Date().getFullYear();
    const newResult = await Result.create({ eventId, result:resultObj , year:parseInt(currentYear) });

    res.status(201).json({ success: true, message: "Result created successfully", data: newResult });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Update result
const updateResult = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { result } = req.body;

    const existingResult = await Result.findById(id);
    if (!existingResult) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    for (const item of result) {
      const classExists = await Class.findById(item._id);
      if (!classExists) {
        return res.status(400).json({ success: false, message: `Class not found for ID: ${item._id}` });
      }
    }

    const resultObj  = result.map((item) => {
      return {
        classId: item._id,
        position: result.indexOf(item) + 1,
      };
    });

    existingResult.result = resultObj;
    await existingResult.save();

    res.status(200).json({ success: true, message: "Result updated successfully", data: existingResult });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Delete result
const deleteResult = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const existingResult = await Result.findById(id);
    if (!existingResult) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    await existingResult.deleteOne();

    res.status(200).json({ success: true, message: "Result deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});


const declareResultForEvent = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
 
    const eventExists = await Event.findById(eventId);
    if (!eventExists) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }


    const result = await Result.findOne({ eventId })
      .populate("eventId")
      .populate({
        path: "result.classId",
        populate: { path: "incharge", select: "email name" },
      });

   
    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found for this event" });
    }

  
    const incharges = await User.find({ user_type: "Teacher" });
 
    if (incharges.size === 0) {
      return res.status(400).json({ success: false, message: "No incharges found to send results" });
    }

    const inchargeEmails = incharges.map((incharge) => incharge.email);

    let resultTable = `
          <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: left;">
              <thead>
                  <tr style="background-color: #f2f2f2;">
                      <th>Class</th>
                      <th>Student Name</th>
                      <th>Position</th>
                  </tr>
              </thead>
              <tbody>
      `;

    result.result.forEach((entry) => {
      resultTable += `
              <tr>
                  <td>${entry.classId.name}</td>
                  <td>${entry.studentName}</td>
                  <td>${entry.position}</td>
              </tr>
          `;
    });

    resultTable += `</tbody></table>`;

    const subject = `Result Declaration: ${eventExists.name}`;
    const message = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #333;">Results for ${eventExists.name}</h2>
              <p>The results for the event <strong>${eventExists.name}</strong> have been declared. Please find the details below:</p>
              ${resultTable}
              <p>Best Regards,<br><strong>Event Management Team</strong></p>
          </div>
      `;
      const text=`Result for the ${eventExists.name} has been declared`

   
    const isEmailSent = await sendMail(subject,[...inchargeEmails],text, message);

    if (!isEmailSent) {
      return res.status(500).json({ success: false, message: "Failed to send/declare result to emails" });
    }

    res.status(200).json({ success: true, message: "Result declared successfully and emails sent to incharges" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});




module.exports = {
  getResultByEventId,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
  declareResultForEvent
};
