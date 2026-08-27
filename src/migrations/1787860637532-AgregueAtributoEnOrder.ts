import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueAtributoEnOrder1787860637532 implements MigrationInterface {
    name = 'AgregueAtributoEnOrder1787860637532'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "shippingImportedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "shippingImportedAt"`);
    }

}
