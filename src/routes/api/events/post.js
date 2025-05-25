// import Event from "../../../models/Event";
import { ZodError } from "zod";
import { createErrorResponse, createSuccessResponse } from "../../../utils/response.js";
import { createEventSchema } from "../../../utils/schemaValidation.js";
import Event from "../../../models/Event.js";
import logger from "../../../utils/logger.js"

// api/v1/events
export async function postEventHandler(req, res) {
  try{
      const name = req.user.name;
      const email = req.user.email;
      logger.info("Name: ", name);
      logger.info("Email: ", email);
      const validatedEventData = createEventSchema.parse(req.body);
      const newEvent = await Event.create({
        ownerName: name, 
        ownerEmail: email, 
        ...validatedEventData,
        isCompleted: false
      });
      res.status(201).json(createSuccessResponse({event: newEvent}));
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
