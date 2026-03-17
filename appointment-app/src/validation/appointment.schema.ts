import * as yup from 'yup';

export const appointmentSchema = yup.object().shape({
  date: yup.date().required('Date is required'),
  time: yup.string().required('Time is required'),
  userId: yup.string().required('User ID is required'),
  status: yup.string().oneOf(['scheduled', 'cancelled', 'pending cancellation'], 'Invalid status').required('Status is required'),
});