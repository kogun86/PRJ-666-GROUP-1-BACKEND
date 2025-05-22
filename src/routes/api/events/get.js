import { createErrorResponse, createSuccessResponse } from "../../../utils/response.js";
import Event from "../../../models/Event.js";
// Just a basic implementation to get it running

let events =  [
      {
        id: 1,
        title: "Career Fair",
        description: "Annual career fair with top tech companies.",
        date: "2024-03-15",
        time: "10:00 AM - 2:00 PM",
        location: "Main Campus Hall"
      }
    ];

export async function getUpcomingEventsHandler(req, res) {
  try{
    const owner = req.user.email;
    let events = await Event.find({ isCompleted: false, ownerEmail: owner });
    if (events[0] == null){
      events = "No Upcoming Events";
    }
    res.status(200).json(createSuccessResponse({events: events}));
  } catch(err){
    res.status(401).json(createErrorResponse(401, err.message));
  }   
}

export async function getCompletedEventsHandler(req,res){
try{
    const owner = req.user.email;
    let events = await Event.find({ isCompleted: true, ownerEmail: owner });
    if (events[0] == null){
      events = "No Events Completed";
    }
    res.status(200).json(createSuccessResponse({events: events}));
  } catch(err){
    res.status(401).json(createErrorResponse(401, err.message));
  }   
}
