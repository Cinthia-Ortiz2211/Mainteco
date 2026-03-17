import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendAppointmentStatus1623456789012 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE appointments
            ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT 'pending',
            ADD COLUMN cancellation_reason VARCHAR(255) NULL,
            ADD COLUMN cancellation_confirmed BOOLEAN DEFAULT FALSE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE appointments
            DROP COLUMN status,
            DROP COLUMN cancellation_reason,
            DROP COLUMN cancellation_confirmed
        `);
    }
}