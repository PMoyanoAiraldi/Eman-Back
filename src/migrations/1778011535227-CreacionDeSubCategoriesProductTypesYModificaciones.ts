import { MigrationInterface, QueryRunner } from "typeorm";

export class CreacionDeSubCategoriesProductTypesYModificaciones1778011535227 implements MigrationInterface {
    name = 'CreacionDeSubCategoriesProductTypesYModificaciones1778011535227'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subcategories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "state" boolean NOT NULL DEFAULT true, "imageUrl" character varying(500), "categoryId" uuid, CONSTRAINT "PK_793ef34ad0a3f86f09d4837007c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "state" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_6ad7b08e6491a02ebc9ed82019d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "imageUrl" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "products" ADD "subcategoryId" uuid`);
        await queryRunner.query(`ALTER TABLE "products" ADD "typeId" uuid`);
        await queryRunner.query(`ALTER TABLE "subcategories" ADD CONSTRAINT "FK_d1fe096726c3c5b8a500950e448" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_7527f75cb36bea4b7f2b86f7d1d" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_6129aa5c0f65c073ea2f7452195" FOREIGN KEY ("typeId") REFERENCES "product_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_6129aa5c0f65c073ea2f7452195"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_7527f75cb36bea4b7f2b86f7d1d"`);
        await queryRunner.query(`ALTER TABLE "subcategories" DROP CONSTRAINT "FK_d1fe096726c3c5b8a500950e448"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "typeId"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "subcategoryId"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`DROP TABLE "product_types"`);
        await queryRunner.query(`DROP TABLE "subcategories"`);
    }

}
