import { MigrationInterface, QueryRunner } from "typeorm";

export class AgreguefocalPointenMediaContent1784317542312 implements MigrationInterface {
    name = 'AgreguefocalPointenMediaContent1784317542312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media_content" ADD "focalPoint" character varying NOT NULL DEFAULT 'center center'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media_content" DROP COLUMN "focalPoint"`);
    }

}
