/**
 * CSHRK Development Seed Script
 * STRICTLY FOR LOCAL DEVELOPMENT AND TESTING ONLY
 * NEVER RUN IN PRODUCTION
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  UserRole,
  AccountStatus,
  WorkerAvailabilityStatus,
  WorkerEmploymentType,
} from '@cshrk/types';
import * as entities from '../entities';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const seedDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'cshrk_db',
  entities: Object.values(entities),
  synchronize: true, // synchronize for seed setup
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function runSeed() {
  console.log('================================================================');
  console.log('  CSHRK DATABASE SEED: DEVELOPMENT / TEST DATA ONLY');
  console.log('================================================================');

  try {
    await seedDataSource.initialize();
    console.log('Connected to PostgreSQL successfully.');

    const userRepo = seedDataSource.getRepository(entities.UserEntity);
    const fedRepo = seedDataSource.getRepository(entities.FederationEntity);
    const coopRepo = seedDataSource.getRepository(entities.CooperativeEntity);
    const customerRepo = seedDataSource.getRepository(entities.CustomerEntity);
    const workerRepo = seedDataSource.getRepository(entities.WorkerEntity);
    const skillRepo = seedDataSource.getRepository(entities.SkillEntity);

    const defaultPassword = await bcrypt.hash('DevPass123!', 10);

    // 1. Seed Federation
    let federation = await fedRepo.findOne({ where: { code: 'FED-DELHI-01' } });
    if (!federation) {
      federation = fedRepo.create({
        name: 'Delhi State Labour Cooperative Federation',
        code: 'FED-DELHI-01',
        state: 'Delhi',
        contactEmail: 'contact@delhicoopfederation.local',
        contactPhone: '+911122334455',
        status: AccountStatus.ACTIVE,
      });
      await fedRepo.save(federation);
      console.log('Created Seed Federation: Delhi State Labour Cooperative Federation');
    }

    // 2. Seed Cooperative
    let cooperative = await coopRepo.findOne({ where: { registrationNumber: 'COOP-ND-001' } });
    if (!cooperative) {
      cooperative = coopRepo.create({
        federationId: federation.id,
        name: 'New Delhi Artisan & Skilled Labour Society',
        registrationNumber: 'COOP-ND-001',
        district: 'New Delhi',
        contactEmail: 'contact@newdelhiartisan.local',
        contactPhone: '+911199887766',
        status: AccountStatus.ACTIVE,
      });
      await coopRepo.save(cooperative);
      console.log('Created Seed Cooperative: New Delhi Artisan & Skilled Labour Society');
    }

    // 3. Seed Skills
    const initialSkills = [
      { name: 'Electrical Wiring & Maintenance', code: 'SKILL-ELEC-01', category: 'Electrical' },
      { name: 'Plumbing & Pipefitting', code: 'SKILL-PLUMB-01', category: 'Plumbing' },
      { name: 'Masonry & Plastering', code: 'SKILL-MASON-01', category: 'Construction' },
      { name: 'Carpentry & Furniture Assembly', code: 'SKILL-CARP-01', category: 'Carpentry' },
    ];

    for (const skillData of initialSkills) {
      const exists = await skillRepo.findOne({ where: { code: skillData.code } });
      if (!exists) {
        await skillRepo.save(skillRepo.create(skillData));
        console.log(`Created Seed Skill: ${skillData.name}`);
      }
    }

    // 4. Seed Development Accounts for all 5 roles
    const seedAccounts = [
      {
        email: 'dev_customer@cshrk.local',
        fullName: 'Demo Customer User',
        role: UserRole.CUSTOMER,
      },
      {
        email: 'dev_worker@cshrk.local',
        fullName: 'Demo Worker User',
        role: UserRole.WORKER,
      },
      {
        email: 'dev_coop@cshrk.local',
        fullName: 'Demo Cooperative Admin',
        role: UserRole.COOPERATIVE_ADMIN,
      },
      {
        email: 'dev_fed@cshrk.local',
        fullName: 'Demo Federation Admin',
        role: UserRole.FEDERATION_ADMIN,
      },
      {
        email: 'dev_admin@cshrk.local',
        fullName: 'Demo Platform Admin',
        role: UserRole.PLATFORM_ADMIN,
      },
    ];

    for (const account of seedAccounts) {
      let user = await userRepo.findOne({ where: { email: account.email } });
      if (!user) {
        user = userRepo.create({
          email: account.email,
          fullName: account.fullName,
          passwordHash: defaultPassword,
          role: account.role,
          status: AccountStatus.ACTIVE,
        });
        await userRepo.save(user);
        console.log(`Created Seed User [${account.role}]: ${account.email}`);

        // Link Customer profile
        if (account.role === UserRole.CUSTOMER) {
          await customerRepo.save(
            customerRepo.create({
              userId: user.id,
              fullName: user.fullName,
              status: AccountStatus.ACTIVE,
            }),
          );
        }

        // Link Worker profile
        if (account.role === UserRole.WORKER) {
          await workerRepo.save(
            workerRepo.create({
              userId: user.id,
              cooperativeId: cooperative.id,
              fullName: user.fullName,
              memberId: 'MEM-2026-001',
              employmentType: WorkerEmploymentType.MEMBER_WORKER,
              status: AccountStatus.ACTIVE,
              availabilityStatus: WorkerAvailabilityStatus.AVAILABLE,
              ratingAvg: 5.0,
              totalJobs: 0,
            }),
          );
        }
      }
    }

    console.log('================================================================');
    console.log('  SEED COMPLETE: All 5 demo accounts ready for testing');
    console.log('  Default password for all demo accounts: DevPass123!');
    console.log('================================================================');
  } catch (error) {
    console.error('Database seed error:', error);
    process.exit(1);
  } finally {
    await seedDataSource.destroy();
  }
}

runSeed();
