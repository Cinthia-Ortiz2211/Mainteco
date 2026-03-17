import { Request, Response } from 'express';
import { validateAppointment } from '../../validation/appointment.schema';
import { createAppointmentInDB } from '../../db/schema/appointment';

export const createAppointment = async (req: Request, res: Response) => {
    try {
        // Validate the incoming request payload
        const validationResult = validateAppointment(req.body);
        if (!validationResult.isValid) {
            return res.status(400).json({ errors: validationResult.errors });
        }

        // Extract appointment details from the request body
        const { date, time, userId, status } = req.body;

        // Create the appointment in the database
        const appointment = await createAppointmentInDB({ date, time, userId, status });

        // Respond with the created appointment details
        return res.status(201).json(appointment);
    } catch (error) {
        console.error('Error creating appointment:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};