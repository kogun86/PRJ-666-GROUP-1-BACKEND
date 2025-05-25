import Event from "../../../models/Event.js";
import { ZodError } from "zod";
import { createErrorResponse, createSuccessResponse } from "../../../utils/response.js";
import { patchGradeCompletedSchema } from "../../../utils/schemaValidation.js";

// api/v1/events/:id/grade/completed
export async function patchCompletedEventHandler(req,res){
  try{
    const { id } = req.params;
    const event = await Event.findById(id);
    if(!event)
      throw new Error("Event Not Found");
    const updatedEvent = await Event.findByIdAndUpdate(id, {isCompleted: true}, {new: true});
    res.status(200).json(createSuccessResponse({event: updatedEvent}));
  } catch(err){
    if (err instanceof ZodError){
      const message = err.errors.map(e => e.message).join(', ');
      res.status(400).json(createErrorResponse(400, message));
      }
    else{
      res.status(401).json(createErrorResponse(401, err.message));
    }
  }  
}
// api/v1/events/:id/grade
export async function patchGradeCompletedEventHandler(req,res){
  try{
    const { id } = req.params;
    const { grade } = patchGradeCompletedSchema.parse(req.body);
    const event = await Event.findById(id);

    if(!event)
      throw new Error("Event Not Found");
    if(event.isCompleted == false)
      throw new Error("Event is not completed");
    const updatedEvent = await Event.findByIdAndUpdate(id, {grade}, {new: true});
    res.status(200).json(createSuccessResponse({event: updatedEvent}));
  } catch(err){
    if (err instanceof ZodError){
      const message = err.errors.map(e => e.message).join(', ');
      res.status(400).json(createErrorResponse(400, message));
    }
    else{
      res.status(401).json(createErrorResponse(401, err.message));
    }
  }  
}