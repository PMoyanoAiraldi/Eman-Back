import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueAtributosEnOrderParaElBotonDeArrepentimiento1793909547704 implements MigrationInterface {
    name = 'AgregueAtributosEnOrderParaElBotonDeArrepentimiento1793909547704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "deliveredAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "withdrawalCode" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "withdrawalRequestedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order" ADD "withdrawalNote" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "withdrawalOutOfTerm" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "withdrawalOutOfTerm"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "withdrawalNote"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "withdrawalRequestedAt"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "withdrawalCode"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "deliveredAt"`);
    }

}
