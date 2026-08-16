import { Router } from 'express';
import { LinksController } from '../controllers';

const router = Router();

// Get all links
router.get('/', LinksController.getAllLinks);

// Get links by status
router.get('/status/:status', LinksController.getLinksByStatus);

// Get links by provider
router.get('/provider/:providerId', LinksController.getLinksByProvider);

// Create new link
router.post('/', LinksController.createLink);

// Get link by ID
router.get('/:id', LinksController.getLinkById);

// Update link
router.put('/:id', LinksController.updateLink);

// Delete link
router.delete('/:id', LinksController.deleteLink);

// Check link immediately
router.post('/:id/check', LinksController.checkLinkNow);

// Get link history
router.get('/:id/history', LinksController.getLinkHistory);

// Get link events
router.get('/:id/events', LinksController.getLinkEvents);

export default router;
