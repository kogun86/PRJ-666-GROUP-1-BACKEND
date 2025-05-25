import { createErrorResponse, createSuccessResponse } from "../../../utils/response.js";
import Event from "../../../models/Event.js";
// Just a basic implementation to get it running

// Local Testing
// let events =  [
//       {
//         id: 1,
//         title: "Career Fair",
//         description: "Annual career fair with top tech companies.",
//         date: "2024-03-15",
//         time: "10:00 AM - 2:00 PM",
//         location: "Main Campus Hall"
//       }
//     ];

// api/v1/events/upcoming
export async function getUpcomingEventsHandler(req, res) {
  try{
    const owner = req.user.email;
    let events = await Event.find({ isCompleted: false, ownerEmail: owner });
    res.status(200).json(createSuccessResponse({events: events || []}));
  } catch(err){
    res.status(401).json(createErrorResponse(401, err.message));
  }   
}
// api/v1/events/completed
export async function getCompletedEventsHandler(req,res){
try{
    const owner = req.user.email;
    let events = await Event.find({ isCompleted: true, ownerEmail: owner });
    if (!events || events.length === 0) {
      events = [];
    }
    res.status(200).json(createSuccessResponse({ events }));
  } catch(err){
    res.status(401).json(createErrorResponse(401, err.message));
  }   
}
