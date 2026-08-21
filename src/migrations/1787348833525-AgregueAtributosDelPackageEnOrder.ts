import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueAtributosDelPackageEnOrder1787348833525 implements MigrationInterface {
    name = 'AgregueAtributosDelPackageEnOrder1787348833525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "packageWeight" integer`);
        await queryRunner.query(`ALTER TABLE "order" ADD "packageHeight" integer`);
        await queryRunner.query(`ALTER TABLE "order" ADD "packageWidth" integer`);
        await queryRunner.query(`ALTER TABLE "order" ADD "packageLength" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "packageLength"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "packageWidth"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "packageHeight"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "packageWeight"`);
    }

}
