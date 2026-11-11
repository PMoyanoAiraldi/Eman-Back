import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueUnAtributoEnOrderParaAgregarUnaNotaEnLasArrepentidas1794431988398 implements MigrationInterface {
    name = 'AgregueUnAtributoEnOrderParaAgregarUnaNotaEnLasArrepentidas1794431988398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "withdrawalRejectionNote" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "withdrawalRejectionNote"`);
    }

}
