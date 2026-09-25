import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvoiceToOrder1790340298696 implements MigrationInterface {
    name = 'AddInvoiceToOrder1790340298696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "invoiceUrl" character varying(500)`);
        await queryRunner.query(`CREATE TYPE "public"."order_invoicestatus_enum" AS ENUM('pendiente', 'lista', 'enviada')`);
        await queryRunner.query(`ALTER TABLE "order" ADD "invoiceStatus" "public"."order_invoicestatus_enum" NOT NULL DEFAULT 'pendiente'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "invoiceStatus"`);
        await queryRunner.query(`DROP TYPE "public"."order_invoicestatus_enum"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "invoiceUrl"`);
    }

}
