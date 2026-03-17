export interface Appointment {
    id: string;
    date: string;
    time: string;
    status: 'scheduled' | 'cancelled' | 'pending cancellation';
    userId: string;
}

export interface PaymentOption {
    type: 'bank_transfer' | 'cash' | 'qr_code';
    details: string; // Additional details for the payment option
}

export interface CreateAppointmentPayload {
    date: string;
    time: string;
    userId: string;
}

export interface CancelAppointmentPayload {
    appointmentId: string;
    userId: string;
}

export interface ConfirmCancelPayload {
    appointmentId: string;
    userId: string;
    confirmation: boolean;
}