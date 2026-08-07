import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueAtributosEnUser1786137998457 implements MigrationInterface {
    name = 'AgregueAtributosEnUser1786137998457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordTokenHash" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordExpiresAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordTokenHash"`);
    }

}
