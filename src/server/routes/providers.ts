import { Router } from 'express';
import { ProvidersController } from '../controllers';

const router = Router();

// Get all providers
router.get('/', ProvidersController.getAllProviders);

// Create new provider
router.post('/', ProvidersController.createProvider);

// Get provider by ID
router.get('/:id', ProvidersController.getProviderById);

// Update provider
router.put('/:id', ProvidersController.updateProvider);

// Delete provider
router.delete('/:id', ProvidersController.deleteProvider);

export default router;
