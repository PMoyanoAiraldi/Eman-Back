import { MigrationInterface, QueryRunner } from "typeorm";

export class EdicionDeAtributoPrvince1781732074678 implements MigrationInterface {
    name = 'EdicionDeAtributoPrvince1781732074678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "province" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "province" DROP NOT NULL`);
    }

}
