import { MigrationInterface, QueryRunner } from "typeorm";

export class CreacionDeColorsYModificaciondeAtributos1779918405801 implements MigrationInterface {
    name = 'CreacionDeColorsYModificaciondeAtributos1779918405801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_detail" DROP CONSTRAINT "FK_b402c1367fc588223b2b821348d"`);
        await queryRunner.query(`ALTER TABLE "order_detail" RENAME COLUMN "sizeId" TO "variantId"`);
        await queryRunner.query(`CREATE TABLE "colors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "hex" character varying(7) NOT NULL, "state" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_3a62edc12d29307872ab1777ced" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stock" integer NOT NULL DEFAULT '0', "productId" uuid, "sizeId" uuid, "colorId" uuid, CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_0e271925ab3814da891704b02bd" FOREIGN KEY ("sizeId") REFERENCES "sizes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_a25f8063109b6344800b860348d" FOREIGN KEY ("colorId") REFERENCES "colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_detail" ADD CONSTRAINT "FK_9593cc3b6ec5accb6a98bcfd14b" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_detail" DROP CONSTRAINT "FK_9593cc3b6ec5accb6a98bcfd14b"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_a25f8063109b6344800b860348d"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_0e271925ab3814da891704b02bd"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`);
        await queryRunner.query(`DROP TABLE "product_variants"`);
        await queryRunner.query(`DROP TABLE "colors"`);
        await queryRunner.query(`ALTER TABLE "order_detail" RENAME COLUMN "variantId" TO "sizeId"`);
        await queryRunner.query(`ALTER TABLE "order_detail" ADD CONSTRAINT "FK_b402c1367fc588223b2b821348d" FOREIGN KEY ("sizeId") REFERENCES "sizes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
