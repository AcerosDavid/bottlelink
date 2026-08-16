import { Request, Response } from 'express';
import { LinkModel, ProviderModel, FileMetadataModel, CheckModel, EventModel } from '../models';
import { ProviderFactory } from '../providers';
import { LinkCheckService } from '../services';
import { LinkStatus } from '../types';

export class LinksController {
  /**
   * Get all links
   */
  static async getAllLinks(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      const links = LinkModel.findAll(limit, offset);
      res.json({ success: true, data: links });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Get link by ID
   */
  static async getLinkById(req: Request, res: Response) {
    try {
      const linkId = parseInt(req.params.id);
      const link = LinkModel.findById(linkId);
      
      if (!link) {
        return res.status(404).json({ 
          success: false, 
          error: 'Link not found' 
        });
      }

      // Get provider
      const provider = ProviderModel.findById(link.provider_id);
      
      // Get file metadata
      const fileMetadata = FileMetadataModel.findByLinkId(linkId);
      
      // Get recent checks
      const recentChecks = CheckModel.findByLinkId(linkId, 10);
      
      // Get recent events
      const recentEvents = EventModel.findByLinkId(linkId, 10);

      res.json({ 
        success: true, 
        data: {
          link,
          provider,
          fileMetadata,
          recentChecks,
          recentEvents
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
   * Create new link
   */
  static async createLink(req: Request, res: Response) {
    try {
      const { url, check_frequency = 60 } = req.body;
      
      if (!url) {
        return res.status(400).json({ 
          success: false, 
          error: 'URL is required' 
        });
      }

      // Check if URL already exists
      const existingLink = LinkModel.findByUrl(url);
      if (existingLink) {
        return res.status(409).json({ 
          success: false, 
          error: 'Link already exists',
          data: existingLink
        });
      }

      // Detect provider
      const providerType = ProviderFactory.detectProviderType(url);
      if (!providerType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Unsupported URL or provider not detected' 
        });
      }

      // Get or create provider
      let provider = ProviderModel.findByType(providerType);
      if (!provider) {
        provider = ProviderModel.create({
          name: providerType,
          type: providerType,
          enabled: true
        });
      }

      // Create link
      const link = LinkModel.create({
        url,
        provider_id: provider.id,
        status: LinkStatus.UNKNOWN,
        check_frequency
      });

      // Schedule initial check
      await LinkCheckService.scheduleLinkCheck(link.id);

      res.status(201).json({ success: true, data: link });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Update link
   */
  static async updateLink(req: Request, res: Response) {
    try {
      const linkId = parseInt(req.params.id);
      const { url, check_frequency, status } = req.body;
      
      const link = LinkModel.findById(linkId);
      if (!link) {
        return res.status(404).json({ 
          success: false, 
          error: 'Link not found' 
        });
      }

      const updateData: any = {};
      if (url !== undefined) updateData.url = url;
      if (check_frequency !== undefined) updateData.check_frequency = check_frequency;
      if (status !== undefined) updateData.status = status;

      const updatedLink = LinkModel.update(linkId, updateData);
      res.json({ success: true, data: updatedLink });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Delete link
   */
  static async deleteLink(req: Request, res: Response) {
    try {
      const linkId = parseInt(req.params.id);
      
      const link = LinkModel.findById(linkId);
      if (!link) {
        return res.status(404).json({ 
          success: false, 
          error: 'Link not found' 
        });
      }

      LinkModel.delete(linkId);
      res.json({ success: true, message: 'Link deleted successfully' });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Check link immediately
   */
  static async checkLinkNow(req: Request, res: Response) {
    try {
      const linkId = parseInt(req.params.id);
      
      const link = LinkModel.findById(linkId);
      if (!link) {
        return res.status(404).json({ 
          success: false, 
          error: 'Link not found' 
        });
      }

      const checkResult = await LinkCheckService.checkLinkNow(linkId);
      res.json({ success: true, data: checkResult });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Get link history
   */
  static async getLinkHistory(req: Request, res: Response) {
    try {
      const linkId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const link = LinkModel.findById(linkId);
      if (!link) {
        return res.status(404).json({ 
          success: false, 
          error: 'Link not found' 
        });
      }

      const history = CheckModel.findByLinkId(linkId, limit);
      res.json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Get link events
   */
  static async getLinkEvents(req: Request, res: Response) {
    try {
      const linkId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const link = LinkModel.findById(linkId);
      if (!link) {
        return res.status(404).json({ 
          success: false, 
          error: 'Link not found' 
        });
      }

      const events = EventModel.findByLinkId(linkId, limit);
      res.json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Get links by status
   */
  static async getLinksByStatus(req: Request, res: Response) {
    try {
      const status = req.params.status as LinkStatus;
      
      if (!Object.values(LinkStatus).includes(status)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid status' 
        });
      }

      const links = LinkModel.findByStatus(status);
      res.json({ success: true, data: links });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Get links by provider
   */
  static async getLinksByProvider(req: Request, res: Response) {
    try {
      const providerId = parseInt(req.params.providerId);
      
      const provider = ProviderModel.findById(providerId);
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          error: 'Provider not found' 
        });
      }

      const links = LinkModel.findByProvider(providerId);
      res.json({ success: true, data: links });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}
