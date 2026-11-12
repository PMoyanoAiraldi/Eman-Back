import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueANameUniqueEnVariasEntidades1794513778557 implements MigrationInterface {
    name = 'AgregueANameUniqueEnVariasEntidades1794513778557'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "brands" ADD CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "product_types" ADD CONSTRAINT "UQ_2b3bfea1c7797e9d067dfc3c7a0" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "sizes" ADD CONSTRAINT "UQ_9fc6e663546e7a6cfdc465e86df" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "subcategories" ADD CONSTRAINT "UQ_45aa12007713728e241d091775d" UNIQUE ("name", "categoryId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subcategories" DROP CONSTRAINT "UQ_45aa12007713728e241d091775d"`);
        await queryRunner.query(`ALTER TABLE "sizes" DROP CONSTRAINT "UQ_9fc6e663546e7a6cfdc465e86df"`);
        await queryRunner.query(`ALTER TABLE "product_types" DROP CONSTRAINT "UQ_2b3bfea1c7797e9d067dfc3c7a0"`);
        await queryRunner.query(`ALTER TABLE "brands" DROP CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`);
    }

}
