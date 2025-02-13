const asyncHandler = require("express-async-handler");
const Event = require("../models/event.model.js");
const User = require("../models/user.model.js");
const sendMail = require("../helpers/mail.helper.js");
const Class = require("../models/class.model.js");
const Registration = require("../models/registration.model.js");
// Create an Event
const createEvent = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    part_type,
    description,
    rules,
    maxStudents,
    minStudents,
    location,
    points,
  } = req.body;

  console.log(req.user);

  const user = await User.findById(req.user.id);
  if (user.user_type !== "Convenor") {
    return res.status(401).json({
      status: false,
      message: "You are not authorized to create an event",
    });
  }

  try {
    // Create the event
    const event = await Event.create({
      name,
      type,
      part_type,
      description,
      rules,
      maxStudents,
      minStudents,
      location,
      convenor: req.user._id,
      points,
    });

    if (!event) {
      return res
        .status(400)
        .json({ status: false, message: "Failed to create event" });
    }

    // Send invitations to all Teachers
    const teachers = await User.find({ user_type: "Teacher" });

    const invitations = teachers.map(async (teacher) => {
      const subject = `Invitation to Register for "${name}" Event`;
      const receiver = teacher.email;

      const formattedRules = rules.length
        ? rules.map((rule, index) => `**${index + 1}.** ${rule}`).join("\n")
        : "_No specific rules provided._";

      const formattedPoints =
        points && points.length === 3
          ? `- 🥇 **1st Place:** ${points[0]} points  
                   - 🥈 **2nd Place:** ${points[1]} points  
                   - 🥉 **3rd Place:** ${points[2]} points`
          : "_Points are not specified._";

      const text = `
        **Dear ${teacher.name},**
        
        We are excited to invite you to participate in our upcoming event, **"${name}"**, which promises to be an engaging and enriching experience.
        
        ---
        
        ### 📌 **Event Details:**
        - **📅 Event Name:** ${name}
        - **📖 Type:** ${type}
        - **👥 Participation Type:** ${part_type}
        - **📍 Location:** ${location}
        - **📝 Description:**  
          ${description}
        - **👨‍💼 Convenor:** ${req.user?.name || "_To Be Decided_"}
        
        ---
        
        ### 📜 **Event Rules:**
        ${formattedRules}
        
        ---
        
        ### 🏆 **Points Distribution:**
        ${formattedPoints}
        
        ---
        
        ### 🔢 **Participation Limits:**
        - **Minimum Students:** ${minStudents}
        - **Maximum Students:** ${maxStudents}
        
        ---
        
        We believe that your participation will add great value to this event. If you're interested, please register at your earliest convenience.
        
        For any queries, feel free to reach out.
        
        Looking forward to your participation! 🚀
        
        ---
        
        **Best regards,**  
        **PCTE Koshish Planning**`;

      try {
        const mailSent = await sendMail(subject, receiver, text);
        return mailSent;
      } catch (emailError) {
        console.error(`Failed to send email to ${teacher.name}:`, emailError);
      }
    });

    // Wait for all email invitations to finish
    await Promise.all(invitations);

    res
      .status(201)
      .json({ status: true, message: "Event created successfully!", event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
});

// Get All Events
const getAllEvents = asyncHandler(async (req, res) => {
  try {
    const events = await Event.find({ is_active: true });
    res.status(200).json({ status: true, events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
});

// Get Single Event by ID
const getEventById = asyncHandler(async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    console.log(event);
    if (!event) {
      return res
        .status(404)
        .json({ status: false, message: "Event not found" });
    }
    res.status(200).json({ status: true, event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
});

const updateEvent = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      type,
      part_type,
      description,
      rules,
      maxStudents,
      minStudents,
      location,
      convenor,
      points,
    } = req.body;

    if (req.user.user_type !== "Convenor") {
      return res.status(401).json({
        status: false,
        message: "You are not authorized to create an event",
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        name,
        type,
        part_type,
        description,
        rules,
        maxStudents,
        minStudents,
        location,
        convenor,
        points,
      },
      { new: true }
    );

    if (!event) {
      return res
        .status(404)
        .json({ status: false, message: "Event not found" });
    }

    // Fetch all teachers to notify them about the update
    const teachers = await User.find({ user_type: "Teacher" });

    await Promise.all(
      teachers.map(async (teacher) => {
        const subject = `Update: "${event.name}" Event Details Changed`;
        const receiver = teacher.email;

        const formattedRules = event.rules?.length
          ? event.rules.map((rule, index) => `${index + 1}. ${rule}`).join("\n")
          : "No specific rules provided.";

        const formattedPoints =
          event.points?.length === 3
            ? `1st Place: ${event.points[0]} points\n2nd Place: ${event.points[1]} points\n3rd Place: ${event.points[2]} points`
            : "Points are not specified.";

        const text = `
                    Dear ${teacher.name},

                    We would like to inform you that there have been some updates to the **"${event.name
          }"** event. Please find the updated details below:

                    **Updated Event Details:**
                    - **Event Name:** ${event.name}
                    - **Type:** ${event.type}
                    - **Participation Type:** ${event.part_type}
                    - **Location:** ${event.location}
                    - **Description:**  
                    ${event.description}
                    - **Convenor:** ${event.convenor?.name || "TBD"}

                    **Updated Event Rules:**
                    ${formattedRules}

                    **Updated Points Distribution:**
                    ${formattedPoints}

                    **Participation Limits:**
                    - Minimum Students: ${event.minStudents}
                    - Maximum Students: ${event.maxStudents}

                    We encourage you to check the updated details and register if you're interested.  

                    For any queries, feel free to reach out.

                    Best regards,  
                    PCTE Koshish Planning`;

        const mailStatus = await sendMail(subject, receiver, text);
        if (!mailStatus) {
          console.error(`Failed to send event update email to ${receiver}`);
        }
      })
    );

    res.status(200).json({
      status: true,
      message: "Event updated successfully and emails sent!",
      event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
});

const deleteEvent = asyncHandler(async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res
        .status(400)
        .json({ status: false, message: "Event not found" });
    }
    res.status(200).json({ status: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
});



const getAllEventsForClass = asyncHandler(async (req, res) => {
  try {
    const inchargeId = req.user._id;
    const classInstance = await Class.findOne({ incharge: inchargeId });
    if (!classInstance) {
      return res.status(404).json({ status: false, message: "Class not found" });
    }
    console.log({ classInstance });
    const classId = classInstance._id;
    const events = await Event.find({ is_active: true });
    console.log({ events })
    const registeredEvents = await Registration.find({ classId });

    console.log({ registeredEvents })

    const result = events.map((event) => {
      const registeredEvent = registeredEvents.find((regEvent) => regEvent.eventId.toString() === event._id.toString());
      return {
        ...event.toObject(),
        register: registeredEvent ? registeredEvent.toObject() : null,
      };
    });

    res.status(200).json({ status: true, message: "Event fetched successfully", result });
  } catch (error) {
    console.log("error : ", error)
    res.status(500).json({ status: false, message: "Internal server error" });
  }
});


module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getAllEventsForClass
};
