import DocumentModel from "../models/documents.model.js";
import User from "../models/user.model.js";

export const createDocumentService = async (title, content, isPublic, userId) => {
    try {
        const doesDocumentExist = await DocumentModel.findOne({ title });
        if (doesDocumentExist) throw new Error(`Document with title : ${title} already exists`);

        const newDocument = await DocumentModel.create({ title, content, isPublic, owner: userId });
        return newDocument;
    } catch (error) {
        throw new Error(`Error creating document: ${error.message}`);
    }
};

export const getAllUserDocumentsService = async (userId) => {
    try {
        const documents = await DocumentModel.find({
            $or: [
                { owner: userId },
                { collaborators: { $elemMatch: { $eq: userId } } }
            ]
        }).populate("owner", "username").populate("collaborators", "username");

        return documents;
    } catch (error) {
        throw new Error(`Error retrieving documents: ${error.message}`);
    }
};

export const getSingleDocumentService = async (documentId) => {
    try {
        const document = await DocumentModel.findById(documentId).populate("owner", "username").populate("collaborators", "username");
        return document;
    } catch (error) {
        throw new Error(`Error retrieving document: ${error.message}`);
    }
};

export const updateDocumentService = async (documentId, title, content, userId) => {
    try {
        const document = await DocumentModel.findById(documentId);
        if (!document) throw new Error(`Document with id : ${documentId} doesn't exist`);

        if (document.owner.toString() !== userId && !document.collaborators.includes(userId)) {
            throw new Error("You are not authorized to update this document");
        }

        const updatedDocument = await DocumentModel.findByIdAndUpdate(documentId, { title, content }, { new: true });
        return updatedDocument;
    } catch (error) {
        throw new Error(`Error updating document: ${error.message}`);
    }
};

export const deleteDocumentService = async (documentId, userId) => {
    try {
        const document = await DocumentModel.findById(documentId);
        if (!document) throw new Error(`Document with id : ${documentId} doesn't exist`);
        if (document.owner.toString() !== userId) throw new Error("You are not authorized to delete this document");

        await DocumentModel.findByIdAndDelete(documentId);
        return document.title;
    } catch (error) {
        throw new Error(`Error deleting document: ${error.message}`);
    }
};

export const addCollaboratorService = async (documentId, collaboratorEmail, userId) => {
    try {
        const document = await DocumentModel.findById(documentId);
        if (!document) throw new Error(`Document with id : ${documentId} doesn't exist`);
        if (document.owner.toString() !== userId) throw new Error("You are not authorized to add collaborator to this document");

        const collaborator = await User.findOne({ email: collaboratorEmail });
        if (!collaborator) throw new Error(`Collaborator with email : ${collaboratorEmail} doesn't exist`);
        if (document.owner.toString() === collaborator._id.toString()) throw new Error(`${collaboratorEmail} is the owner of this document`);
        if (document.collaborators.includes(collaborator._id)) throw new Error(`${collaboratorEmail} is already a collaborator`);

        document.collaborators.push(collaborator._id);
        await document.save();
        return document;
    } catch (error) {
        throw new Error(`Error adding collaborator: ${error.message}`);
    }
};

export const getAllCollaboratorsService = async (documentId) => {
    try {
        const document = await DocumentModel.findById(documentId).populate("collaborators", "username");
        if (!document) throw new Error(`Document with id : ${documentId} doesn't exist`);

        return document.collaborators;
    } catch (error) {
        throw new Error(`Error retrieving collaborators: ${error.message}`);
    }
};
