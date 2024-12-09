import * as DocumentService from "../services/DocumentService.js";
import { successHandler, errorHandler } from "../utils/responseHandler.js";
import DocumentModel from '../models/documents.model.js'

export const createDocument = async (req, res) => {
  try {
    const { title, content, isPublic } = req.body;
    const newDocument = await DocumentService.createDocumentService(
      title,
      content,
      isPublic,
      req.user.id
    );
    return successHandler(res, `Document with title: ${title} created successfully`, newDocument, 201);
  } catch (error) {
    return errorHandler(res, "Failed to create document", error, 500);
  }
};

export const getAllRespectedUserDocuments = async (req, res) => {
  try {
    const documents = await DocumentService.getAllUserDocumentsService(req.user.id);
    return successHandler(res, "All documents fetched successfully", documents, 200);
  } catch (error) {
    return errorHandler(res, "Failed to fetch documents", error, 500);
  }
};

export const getSingleUserDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await DocumentService.getSingleDocumentService(documentId);
    return successHandler(res, "Document fetched successfully", document, 200);
  } catch (error) {
    return errorHandler(res, "Failed to fetch document", error, 500);
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { title, content } = req.body;
    const updatedDocument = await DocumentService.updateDocumentService(
      documentId,
      title,
      content,
      req.user.id
    );
    return successHandler(res, `Document with ID: ${documentId} updated successfully`, updatedDocument, 200);
  } catch (error) {
    return errorHandler(res, "Failed to update document", error, 500);
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const deletedDocumentTitle = await DocumentService.deleteDocumentService(
      documentId,
      req.user.id
    );
    return successHandler(res, `Document: ${deletedDocumentTitle} deleted successfully`, {}, 200);
  } catch (error) {
    return errorHandler(res, "Failed to delete document", error, 500);
  }
};

export const addCollaborator = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { collaboratorEmail } = req.body;
    const updatedDocument = await DocumentService.addCollaboratorService(
      documentId,
      collaboratorEmail,
      req.user.id
    );
    return successHandler(res, "Successfully added collaborator", updatedDocument, 200);
  } catch (error) {
    return errorHandler(res, "Failed to add collaborator", error, 500);
  }
};

export const getAllCollaborators = async (req, res) => {
  try {
    const { documentId } = req.params;
    const collaborators = await DocumentService.getAllCollaboratorsService(documentId);
    return successHandler(res, "All collaborators fetched successfully", collaborators, 200);
  } catch (error) {
    return errorHandler(res, "Failed to fetch collaborators", error, 500);
  }
};

export const getDocThroughSocket = async (id) => {
  try {
    const document = await DocumentModel.findById(id);
    return document;
  } catch (error) {
    console.log("Error fetching document through socket:", error);
    throw error;
  }
};
