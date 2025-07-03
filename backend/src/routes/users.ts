
import express from 'express';
import { UserModel } from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { role, limit } = req.query;
    const users = await UserModel.findAll(
      role as string,
      limit ? parseInt(limit as string) : undefined
    );
    
    // Remove passwords from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userProfile } = user;
    res.json(userProfile);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove sensitive fields
    delete updates.password;
    delete updates.email;
    
    await UserModel.update(req.params.id, updates);
    
    const updatedUser = await UserModel.findById(req.params.id);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password, ...userProfile } = updatedUser;
    res.json({ message: 'User updated successfully', user: userProfile });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/:id', auth, async (req, res) => {
  try {
    await UserModel.delete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
