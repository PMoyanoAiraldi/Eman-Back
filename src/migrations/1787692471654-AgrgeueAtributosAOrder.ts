import { MigrationInterface, QueryRunner } from "typeorm";

export class AgrgeueAtributosAOrder1787692471654 implements MigrationInterface {
    name = 'AgrgeueAtributosAOrder1787692471654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_deliverytype_enum" AS ENUM('domicilio', 'sucursal')`);
        await queryRunner.query(`ALTER TABLE "order" ADD "deliveryType" "public"."order_deliverytype_enum" NOT NULL DEFAULT 'domicilio'`);
        await queryRunner.query(`ALTER TABLE "order" ADD "agencyCode" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "agencyName" character varying(150)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "agencyAddress" character varying(300)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "agencyAddress"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "agencyName"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "agencyCode"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "deliveryType"`);
        await queryRunner.query(`DROP TYPE "public"."order_deliverytype_enum"`);
    }

}
