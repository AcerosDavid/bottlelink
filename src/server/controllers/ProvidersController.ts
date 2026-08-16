import { Request, Response } from 'express';
import { ProviderModel, LinkModel } from '../models';

export class ProvidersController {
  /**
   * Get all providers
   */
  static async getAllProviders(req: Request, res: Response) {
    try {
      const providers = ProviderModel.findAll();
      res.json({ success: true, data: providers });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Get provider by ID
   */
  static async getProviderById(req: Request, res: Response) {
    try {
      const providerId = parseInt(req.params.id);
      const provider = ProviderModel.findById(providerId);
      
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          error: 'Provider not found' 
        });
      }

      // Get links for this provider
      const links = LinkModel.findByProvider(providerId);

      res.json({ 
        success: true, 
        data: {
          provider,
          links: {
            total: links.length,
            active: links.filter(l => l.status === 'ACTIVE').length,
            dead: links.filter(l => l.status === 'DEAD').length
          }
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Create new provider
   */
  static async createProvider(req: Request, res: Response) {
    try {
      const { name, type, enabled = true, config } = req.body;
      
      if (!name || !type) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name and type are required' 
        });
      }

      const provider = ProviderModel.create({
        name,
        type,
        enabled,
        config
      });

      res.status(201).json({ success: true, data: provider });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Update provider
   */
  static async updateProvider(req: Request, res: Response) {
    try {
      const providerId = parseInt(req.params.id);
      const { name, enabled, config } = req.body;
      
      const provider = ProviderModel.findById(providerId);
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          error: 'Provider not found' 
        });
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (enabled !== undefined) updateData.enabled = enabled;
      if (config !== undefined) updateData.config = config;

      const updatedProvider = ProviderModel.update(providerId, updateData);
      res.json({ success: true, data: updatedProvider });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Delete provider
   */
  static async deleteProvider(req: Request, res: Response) {
    try {
      const providerId = parseInt(req.params.id);
      
      const provider = ProviderModel.findById(providerId);
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          error: 'Provider not found' 
        });
      }

      // Check if provider has links
      const links = LinkModel.findByProvider(providerId);
      if (links.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cannot delete provider with existing links' 
        });
      }

      ProviderModel.delete(providerId);
      res.json({ success: true, message: 'Provider deleted successfully' });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}
