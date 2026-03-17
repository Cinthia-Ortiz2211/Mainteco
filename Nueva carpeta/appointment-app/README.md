# Appointment App

This project is an appointment management application that allows users to create, cancel, and manage appointments. It also supports various payment options.

## Features

- Create appointments
- Cancel appointments with confirmation
- View available payment options: Bank transfer, cash, and QR code from a virtual wallet
- Strict validation for appointment and payment payloads

## Project Structure

```
appointment-app
├── src
│   ├── app.ts                # Entry point of the application
│   ├── api                   # API routes for appointments and payments
│   │   ├── appointments
│   │   │   ├── create.ts     # Handles appointment creation
│   │   │   ├── cancel.ts     # Handles appointment cancellation
│   │   │   └── confirm-cancel.ts # Confirms appointment cancellation
│   │   └── payments
│   │       └── options.ts    # Provides available payment options
│   ├── db                    # Database schema and migrations
│   │   ├── schema
│   │   │   ├── appointment.ts # Defines appointment schema
│   │   │   └── payment.ts     # Defines payment schema
│   │   └── migrations
│   │       └── extend-appointment-status.ts # Migration for appointment status
│   ├── validation             # Validation schemas
│   │   ├── appointment.schema.ts # Validates appointment payloads
│   │   └── payment.schema.ts  # Validates payment payloads
│   └── types                 # Type definitions
│       └── index.ts          # Exports various types and interfaces
├── package.json              # npm configuration file
├── tsconfig.json             # TypeScript configuration file
└── README.md                 # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd appointment-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your database and run migrations.

4. Start the application:
   ```
   npm run dev
   ```

## Usage

- Access the API endpoints for managing appointments and payments.
- Follow the API documentation for details on request and response formats.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.