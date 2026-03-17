import { Request, Response } from 'express';
import { Appointment } from '../../db/schema/appointment';
import { validateCancellation } from '../../validation/appointment.schema';

export const confirmCancel = async (req: Request, res: Response) => {
    const { appointmentId, confirm } = req.body;

    // Validate the request payload
    const { error } = validateCancellation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    if (confirm) {
        try {
            // Update the appointment status to cancelled in the database
            await Appointment.updateOne({ _id: appointmentId }, { status: 'cancelled' });
            return res.status(200).json({ message: 'Appointment cancelled successfully.' });
        } catch (err) {
            return res.status(500).json({ message: 'Error cancelling appointment.', error: err.message });
        }
    } else {
        return res.status(400).json({ message: 'Cancellation not confirmed.' });
    }
};