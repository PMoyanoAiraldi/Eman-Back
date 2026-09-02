import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregueEnEnumDeUserDeveloper1788378596381 implements MigrationInterface {
    name = 'AgregueEnEnumDeUserDeveloper1788378596381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."users_rol_enum" RENAME TO "users_rol_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_rol_enum" AS ENUM('admin', 'cliente', 'developer')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rol" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rol" TYPE "public"."users_rol_enum" USING "rol"::"text"::"public"."users_rol_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rol" SET DEFAULT 'cliente'`);
        await queryRunner.query(`DROP TYPE "public"."users_rol_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_rol_enum_old" AS ENUM('admin', 'cliente')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rol" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rol" TYPE "public"."users_rol_enum_old" USING "rol"::"text"::"public"."users_rol_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "rol" SET DEFAULT 'cliente'`);
        await queryRunner.query(`DROP TYPE "public"."users_rol_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_rol_enum_old" RENAME TO "users_rol_enum"`);
    }

}
