import express from 'express';
import {
  createDocument,
  getAllRespectedUserDocuments,
  getSingleUserDocument,
  updateDocument,
  deleteDocument,
  addCollaborator,
  getAllCollaborators,
} from '../controllers/doc.controller.js';

import authenticateToken from '../middlewares/auth.middleware.js';

const documentRouter = express.Router();

// Get all respected user documents (authenticated route)
documentRouter.get('/', authenticateToken, getAllRespectedUserDocuments);

// Create a new document (authenticated route)
documentRouter.post('/', authenticateToken, createDocument);

// Get a single user's document (authenticated route)
documentRouter.get('/:documentId', authenticateToken, getSingleUserDocument);

// Update a document (authenticated route)
documentRouter.patch('/:documentId', authenticateToken, updateDocument);

// Delete a document (authenticated route)
documentRouter.delete('/:documentId', authenticateToken, deleteDocument);

// Add a collaborator to a document (authenticated route)
documentRouter.patch('/add-collaborator/:documentId', authenticateToken, addCollaborator);

// Get all collaborators of a document (authenticated route)
documentRouter.get('/get-all-collaborators/:documentId', authenticateToken, getAllCollaborators);

export default documentRouter;
