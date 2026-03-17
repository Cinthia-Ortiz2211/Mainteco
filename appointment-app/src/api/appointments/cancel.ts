import { Request, Response } from 'express';
import { Appointment } from '../../db/schema/appointment';
import { validateCancellation } from '../../validation/appointment.schema';

export const cancelAppointment = async (req: Request, res: Response) => {
    const { appointmentId } = req.body;

    // Validate the cancellation request
    const { error } = validateCancellation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Find the appointment by ID
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Update the appointment status to 'cancelled'
        appointment.status = 'cancelled';
        await appointment.save();

        // Optionally, trigger notifications here

        return res.status(200).json({ message: 'Appointment cancelled successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'An error occurred while cancelling the appointment', error: err.message });
    }
};