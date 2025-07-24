import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
} from "../controllers/contactController.js";

const contactRouter = express.Router();

contactRouter.post("/", createContact);
contactRouter.get("/", getAllContacts);
contactRouter.get("/:id", getContactById);
contactRouter.delete("/:id", deleteContact);

export default contactRouter;
