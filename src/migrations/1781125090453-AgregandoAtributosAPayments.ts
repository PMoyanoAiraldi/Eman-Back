import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregandoAtributosAPayments1781125090453 implements MigrationInterface {
    name = 'AgregandoAtributosAPayments1781125090453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD "preferenceId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "mpPaymentId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "installments" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "installmentsAmount" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "installmentsAmount" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "installments" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "mpPaymentId"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "preferenceId"`);
    }

}
