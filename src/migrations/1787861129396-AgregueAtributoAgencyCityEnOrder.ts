import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueAtributoAgencyCityEnOrder1787861129396 implements MigrationInterface {
    name = 'AgregueAtributoAgencyCityEnOrder1787861129396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "agencyCity" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "agencyCity"`);
    }

}
