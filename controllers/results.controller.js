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
    const {year}=req.query;
    const eventExists = await Event.findById(eventId);
    if (!eventExists) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    const result = await Result.findOne({ eventId,year}).populate("eventId").populate("result");
    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found for this event",event:eventExists});
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Get a single result by ID
const getResultById = asyncHandler(async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate("eventId").populate("result");
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
    const eventExists = await Event.findById(eventId);
    if (!eventExists) {
      return res.status(400).json({ success: false, message: "Event not found" });
    }
    for (const item of result) {
      const classExists = await Class.findOne({_id:item,type:eventExists.type});
      if (!classExists) {
        return res.status(400).json({ success: false, message: `Class not found for ID: ${item.classId}` });
      }
    }
    const existingResult = await Result.findOne({ eventId });
    if (existingResult) {
      return res.status(400).json({ success: false, message: "Result for this event already exists" });
    }

    const newResult = await Result.create({ eventId, result });

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
      const classExists = await Class.findById(item.classId);
      if (!classExists) {
        return res.status(400).json({ success: false, message: `Class not found for ID: ${item.classId}` });
      }
    }

    existingResult.result = result;
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



const finalResult = asyncHandler(async (req, res) => {
  try {
    const {year,type}=req.query;
    
    if(type!=="Senior" && type!=="Junior"){
      return res.status(404).json({ message: "Type Not Found" });
    }

    // Fetch all active events with points assigned
    const events = await Event.find({ is_active: true,type, points: { $exists: true, $not: { $size: 0 } }});
    
    if (!events.length) {
      return res.status(404).json({ message: "No active events with points found." });
    }
    
    // Fetch all results
    const results = await Result.find({year}).populate("result", "_id");
    
    let classScores = new Map();
    
    results.forEach((result) => {
      const event = events.find(e => e._id.equals(result.eventId));
      if (!event || !event.points || event.points.length < 3) return;
      result.result.forEach((classObj, index) => {
        let classId = classObj._id.toString(); // Ensure we're using only the ID
        let pointsAwarded = event.points[index] || 0;
        classScores.set(classId, (classScores.get(classId) || 0) + pointsAwarded);
      });
    });
    
    // Fetch class details with proper ObjectId conversion
    // const topClasses = await Class.find({ _id: { $in: sortedClasses.map(c => new mongoose.Types.ObjectId(c[0])) } }).select("name").lean();
    const topClasses = await Class.find({type}).select("name type").lean();
    
    // Attach scores
    const finalResult = topClasses.map(cls => ({
      ...cls,
      totalPoints: classScores.get(cls._id.toString()) || 0,
    })).sort((a, b) => b.totalPoints - a.totalPoints);
    
    res.status(200).json({ topClasses: finalResult });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});



module.exports = {
  getResultByEventId,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
  declareResultForEvent,
  finalResult
};
