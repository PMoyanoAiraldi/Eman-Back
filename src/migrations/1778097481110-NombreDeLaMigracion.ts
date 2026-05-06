import { MigrationInterface, QueryRunner } from "typeorm";

export class NombreDeLaMigracion1778097481110 implements MigrationInterface {
    name = 'NombreDeLaMigracion1778097481110'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "gender" character varying(10)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "gender"`);
    }

}
