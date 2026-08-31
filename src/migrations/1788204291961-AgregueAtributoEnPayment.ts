import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueAtributoEnPayment1788204291961 implements MigrationInterface {
    name = 'AgregueAtributoEnPayment1788204291961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD "cardBrand" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "cardBrand"`);
    }

}
