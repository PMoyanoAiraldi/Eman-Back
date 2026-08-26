import { MigrationInterface, QueryRunner } from "typeorm";

export class EditeAtributosParaQueSeanNullEnOrder1787768616879 implements MigrationInterface {
    name = 'EditeAtributosParaQueSeanNullEnOrder1787768616879'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "deliveryType" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "deliveryType" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "deliveryType" SET DEFAULT 'domicilio'`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "deliveryType" SET NOT NULL`);
    }

}
