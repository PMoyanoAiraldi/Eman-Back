import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueDosAtributosAOrderParaConsultarOrdenesArrepentidas1794422027085 implements MigrationInterface {
    name = 'AgregueDosAtributosAOrderParaConsultarOrdenesArrepentidas1794422027085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_withdrawalstatus_enum" AS ENUM('solicitado', 'reembolsado', 'rechazado')`);
        await queryRunner.query(`ALTER TABLE "order" ADD "withdrawalStatus" "public"."order_withdrawalstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "withdrawalResolvedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "withdrawalResolvedAt"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "withdrawalStatus"`);
        await queryRunner.query(`DROP TYPE "public"."order_withdrawalstatus_enum"`);
    }

}
