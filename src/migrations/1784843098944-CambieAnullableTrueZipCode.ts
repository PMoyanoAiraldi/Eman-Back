import { MigrationInterface, QueryRunner } from "typeorm";

export class CambieAnullableTrueZipCode1784843098944 implements MigrationInterface {
    name = 'CambieAnullableTrueZipCode1784843098944'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "zipCode" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."order_shippingtype_enum" RENAME TO "order_shippingtype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_shippingtype_enum" AS ENUM('coordinado', 'correo_argentino', 'retiro_en_local')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "shippingType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "shippingType" TYPE "public"."order_shippingtype_enum" USING "shippingType"::"text"::"public"."order_shippingtype_enum"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "shippingType" SET DEFAULT 'correo_argentino'`);
        await queryRunner.query(`DROP TYPE "public"."order_shippingtype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_shippingtype_enum_old" AS ENUM('coordinado', 'correo_argentino')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "shippingType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "shippingType" TYPE "public"."order_shippingtype_enum_old" USING "shippingType"::"text"::"public"."order_shippingtype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "shippingType" SET DEFAULT 'correo_argentino'`);
        await queryRunner.query(`DROP TYPE "public"."order_shippingtype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_shippingtype_enum_old" RENAME TO "order_shippingtype_enum"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "zipCode" SET NOT NULL`);
    }

}
