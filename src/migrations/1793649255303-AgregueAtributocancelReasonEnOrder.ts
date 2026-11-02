import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueAtributocancelReasonEnOrder1793649255303 implements MigrationInterface {
    name = 'AgregueAtributocancelReasonEnOrder1793649255303'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_cancelreason_enum" AS ENUM('abandonada', 'rechazada', 'cancelada_por_cliente', 'vencida_en_revision', 'cancelada_por_admin')`);
        await queryRunner.query(`ALTER TABLE "order" ADD "cancelReason" "public"."order_cancelreason_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "cancelReason"`);
        await queryRunner.query(`DROP TYPE "public"."order_cancelreason_enum"`);
    }

}
