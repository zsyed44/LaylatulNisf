import { Router } from 'express';
import type { StorageAdapter } from '../types.js';

export function createRegistrationsRouter(storage: StorageAdapter) {
  const router = Router();

  // TODO: Add authentication middleware here
  // Example: router.use(authenticateAdmin);

  router.get('/', async (req, res) => {
    try {
      const registrations = await storage.getAllRegistrations();
      res.json({ success: true, data: registrations });
    } catch (error) {
      console.error('Error fetching registrations:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch registrations' 
      });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid registration ID' 
        });
      }

      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ 
          success: false, 
          error: 'Registration not found' 
        });
      }

      res.json({ success: true, data: registration });
    } catch (error) {
      console.error('Error fetching registration:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch registration' 
      });
    }
  });

  return router;
}

