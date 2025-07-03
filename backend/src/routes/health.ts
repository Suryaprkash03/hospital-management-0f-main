
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Hospital Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

router.get('/db', async (req, res) => {
  try {
    // Test database connection
    const testCollection = require('../config/firebase').db.collection('health_check');
    const testDoc = await testCollection.add({
      timestamp: new Date(),
      test: true
    });
    
    res.json({
      status: 'OK',
      message: 'Database connection successful',
      docId: testDoc.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
});

export { router as healthRoutes };
