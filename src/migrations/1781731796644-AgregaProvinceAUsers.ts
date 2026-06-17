import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregaProvinceAUsers1781731796644 implements MigrationInterface {
    name = 'AgregaProvinceAUsers1781731796644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "province" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "province"`);
    }

}
