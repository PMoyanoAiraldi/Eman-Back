import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueMedidasParaElPAqueteEnProductYPackaginEnCategories1795634208974 implements MigrationInterface {
    name = 'AgregueMedidasParaElPAqueteEnProductYPackaginEnCategories1795634208974'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."categories_packaging_enum" AS ENUM('BOLSA', 'CAJA')`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "packaging" "public"."categories_packaging_enum" NOT NULL DEFAULT 'BOLSA'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "heightCm" integer`);
        await queryRunner.query(`ALTER TABLE "products" ADD "widthCm" integer`);
        await queryRunner.query(`ALTER TABLE "products" ADD "lengthCm" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "lengthCm"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "widthCm"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "heightCm"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "packaging"`);
        await queryRunner.query(`DROP TYPE "public"."categories_packaging_enum"`);
    }

}
