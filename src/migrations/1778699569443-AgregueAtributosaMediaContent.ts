import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueAtributosaMediaContent1778699569443 implements MigrationInterface {
    name = 'AgregueAtributosaMediaContent1778699569443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media_content" ADD "tag" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "media_content" ADD "title" character varying(150)`);
        await queryRunner.query(`ALTER TABLE "media_content" ADD "subtitle" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "media_content" ADD "ctaText" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "media_content" ADD "ctaUrl" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media_content" DROP COLUMN "ctaUrl"`);
        await queryRunner.query(`ALTER TABLE "media_content" DROP COLUMN "ctaText"`);
        await queryRunner.query(`ALTER TABLE "media_content" DROP COLUMN "subtitle"`);
        await queryRunner.query(`ALTER TABLE "media_content" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "media_content" DROP COLUMN "tag"`);
    }

}
