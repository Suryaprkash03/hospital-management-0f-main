
import express from 'express';
import { AppointmentModel } from '../models/Appointment';
import { auth } from '../middleware/auth';

const router = express.Router();

// Create appointment
router.post('/', auth, async (req, res) => {
  try {
    const appointmentId = await AppointmentModel.create(req.body);
    const appointment = await AppointmentModel.findById(appointmentId);
    res.status(201).json({ message: 'Appointment created successfully', appointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointments by patient
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const { limit } = req.query;
    const appointments = await AppointmentModel.findByPatient(
      req.params.patientId,
      limit ? parseInt(limit as string) : undefined
    );
    res.json(appointments);
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointments by doctor
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const appointments = await AppointmentModel.findByDoctor(
      req.params.doctorId,
      date as string
    );
    res.json(appointments);
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await AppointmentModel.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment
router.put('/:id', auth, async (req, res) => {
  try {
    await AppointmentModel.update(req.params.id, req.body);
    const appointment = await AppointmentModel.findById(req.params.id);
    res.json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    await AppointmentModel.delete(req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
