import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueEntidadSiteSettings1785354821615 implements MigrationInterface {
    name = 'AgregueEntidadSiteSettings1785354821615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "site_settings" ("id" SERIAL NOT NULL, "maintenanceMode" boolean NOT NULL DEFAULT false, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e4290e8371a166d7e066d131f6e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "site_settings"`);
    }

}
