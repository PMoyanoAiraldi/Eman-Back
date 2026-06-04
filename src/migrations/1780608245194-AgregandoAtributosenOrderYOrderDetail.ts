import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregandoAtributosenOrderYOrderDetail1780608245194 implements MigrationInterface {
    name = 'AgregandoAtributosenOrderYOrderDetail1780608245194'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_detail" ADD "productName" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ADD "guestName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "guestEmail" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "guestPhone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "shippingCost" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "zipCode"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "zipCode" character varying(10) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "zipCode"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "zipCode" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "shippingCost"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "guestPhone"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "guestEmail"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "guestName"`);
        await queryRunner.query(`ALTER TABLE "order_detail" DROP COLUMN "productName"`);
    }

}
