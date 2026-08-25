import { MigrationInterface, QueryRunner } from "typeorm";

export class AgrgeueAtributosAUsersYOrder1787603227356 implements MigrationInterface {
    name = 'AgrgeueAtributosAUsersYOrder1787603227356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "province"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "streetName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "streetNumber" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "floor" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "apartment" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "provinceCode" character varying(1)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "streetName" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "streetNumber" character varying(10) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "floor" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "apartment" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "provinceCode" character varying(1) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provinceCode"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "apartment"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "floor"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "streetNumber"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "streetName"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "provinceCode"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "apartment"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "floor"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "streetNumber"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "streetName"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "province" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "address" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ADD "address" character varying(255) NOT NULL`);
    }

}
