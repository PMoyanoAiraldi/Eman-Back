import { MigrationInterface, QueryRunner } from "typeorm";

export class AddisDraftinProducts1784136123037 implements MigrationInterface {
    name = 'AddisDraftinProducts1784136123037'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "isDraft" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "isDraft"`);
    }

}
