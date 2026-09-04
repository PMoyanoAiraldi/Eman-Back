import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueTrackingNumberEnOrder1788555580996 implements MigrationInterface {
    name = 'AgregueTrackingNumberEnOrder1788555580996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "trackingNumber" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "trackingNumber"`);
    }

}
