import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInOrderconfirmactionEmailSentAt1783454768165 implements MigrationInterface {
    name = 'AddInOrderconfirmactionEmailSentAt1783454768165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "confirmationEmailSentAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "confirmationEmailSentAt"`);
    }

}
