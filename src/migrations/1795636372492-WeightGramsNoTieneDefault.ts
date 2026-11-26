import { MigrationInterface, QueryRunner } from "typeorm";

export class WeightGramsNoTieneDefault1795636372492 implements MigrationInterface {
    name = 'WeightGramsNoTieneDefault1795636372492'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "weightGrams" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "weightGrams" SET DEFAULT '200'`);
    }

}
