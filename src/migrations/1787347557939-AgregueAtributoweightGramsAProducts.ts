import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueAtributoweightGramsAProducts1787347557939 implements MigrationInterface {
    name = 'AgregueAtributoweightGramsAProducts1787347557939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "weightGrams" integer NOT NULL DEFAULT '200'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "weightGrams"`);
    }

}
