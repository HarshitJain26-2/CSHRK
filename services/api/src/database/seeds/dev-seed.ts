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
  ProficiencyLevel,
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

    const serviceRepo = seedDataSource.getRepository(entities.ServiceEntity);
    const workerSkillRepo = seedDataSource.getRepository(entities.WorkerSkillEntity);

    // 4. Seed Services linked to Skills
    const elecSkill = await skillRepo.findOne({ where: { code: 'SKILL-ELEC-01' } });
    const plumbSkill = await skillRepo.findOne({ where: { code: 'SKILL-PLUMB-01' } });
    const masonSkill = await skillRepo.findOne({ where: { code: 'SKILL-MASON-01' } });
    const carpSkill = await skillRepo.findOne({ where: { code: 'SKILL-CARP-01' } });

    const initialServices = [
      {
        name: 'Plumbing & Pipe Leakage Repair',
        category: 'Plumbing',
        description: 'Complete inspection and repair of pipe leaks, taps, sink blockages, and valves.',
        basePrice: 450.0,
        unit: 'HOUR',
        isActive: true,
        skillId: plumbSkill?.id,
      },
      {
        name: 'Electrical Wiring & Breaker Maintenance',
        category: 'Electrical',
        description: 'Fault detection, switchboard replacement, fuse diagnostics, and home wiring.',
        basePrice: 500.0,
        unit: 'HOUR',
        isActive: true,
        skillId: elecSkill?.id,
      },
      {
        name: 'Carpentry & Furniture Assembly',
        category: 'Carpentry',
        description: 'Custom wooden cabinetry, door alignment, hinge installation, and furniture repairs.',
        basePrice: 600.0,
        unit: 'HOUR',
        isActive: true,
        skillId: carpSkill?.id,
      },
      {
        name: 'Masonry & Tile Grouting',
        category: 'Construction',
        description: 'Floor and wall tile laying, brick patching, cement crack filling, and plastering.',
        basePrice: 700.0,
        unit: 'HOUR',
        isActive: true,
        skillId: masonSkill?.id,
      },
      {
        name: 'Deep Washroom & Kitchen Sanitization',
        category: 'Cleaning',
        description: 'High-grade eco sanitization, stain removal, grease degreasing, and disinfection.',
        basePrice: 550.0,
        unit: 'VISIT',
        isActive: true,
        skillId: plumbSkill?.id,
      },
      {
        name: 'Air Conditioner Inspection & Filter Service',
        category: 'Appliance',
        description: 'Split and window AC deep coil wash, pressure check, and airflow tuning.',
        basePrice: 750.0,
        unit: 'VISIT',
        isActive: true,
        skillId: elecSkill?.id,
      },
    ];

    for (const s of initialServices) {
      let service = await serviceRepo.findOne({ where: { name: s.name } });
      if (!service) {
        service = serviceRepo.create(s);
        await serviceRepo.save(service);
        console.log(`Created Seed Service: ${s.name} [${s.category}]`);
      } else if (!service.skillId && s.skillId) {
        service.skillId = s.skillId;
        await serviceRepo.save(service);
      }
    }

    // 5. Seed Development Accounts for all 5 roles
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

    let demoWorkerEntity: entities.WorkerEntity | null = null;

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
              phone: '+919876543210',
              address: 'A-42, Connaught Place, New Delhi, Delhi 110001',
              defaultLocation: {
                type: 'Point',
                coordinates: [77.2167, 28.6328],
              },
              status: AccountStatus.ACTIVE,
            }),
          );
        }

        // Link Worker profile
        if (account.role === UserRole.WORKER) {
          demoWorkerEntity = await workerRepo.save(
            workerRepo.create({
              userId: user.id,
              cooperativeId: cooperative.id,
              fullName: user.fullName,
              memberId: 'MEM-2026-001',
              employmentType: WorkerEmploymentType.MEMBER_WORKER,
              status: AccountStatus.ACTIVE,
              availabilityStatus: WorkerAvailabilityStatus.AVAILABLE,
              ratingAvg: 4.9,
              totalJobs: 18,
              currentLocation: {
                type: 'Point',
                coordinates: [77.209, 28.6139], // Delhi coordinates
              },
            }),
          );
        }
      } else {
        if (account.role === UserRole.WORKER) {
          demoWorkerEntity = await workerRepo.findOne({ where: { userId: user.id } });
          if (demoWorkerEntity && !demoWorkerEntity.currentLocation) {
            demoWorkerEntity.currentLocation = {
              type: 'Point',
              coordinates: [77.209, 28.6139],
            };
            demoWorkerEntity.availabilityStatus = WorkerAvailabilityStatus.AVAILABLE;
            await workerRepo.save(demoWorkerEntity);
          }
        } else if (account.role === UserRole.CUSTOMER) {
          const cust = await customerRepo.findOne({ where: { userId: user.id } });
          if (cust && !cust.defaultLocation) {
            cust.phone = '+919876543210';
            cust.address = 'A-42, Connaught Place, New Delhi, Delhi 110001';
            cust.defaultLocation = {
              type: 'Point',
              coordinates: [77.2167, 28.6328],
            };
            await customerRepo.save(cust);
          }
        }
      }
    }

    // 6. Seed Verified Worker Skills for Demo Worker
    if (demoWorkerEntity && plumbSkill && elecSkill) {
      const existingWsPlumb = await workerSkillRepo.findOne({
        where: { workerId: demoWorkerEntity.id, skillId: plumbSkill.id },
      });
      if (!existingWsPlumb) {
        await workerSkillRepo.save(
          workerSkillRepo.create({
            workerId: demoWorkerEntity.id,
            skillId: plumbSkill.id,
            proficiencyLevel: ProficiencyLevel.EXPERT,
            isVerified: true,
          }),
        );
        console.log('Linked verified Plumbing skill to Demo Worker');
      }

      const existingWsElec = await workerSkillRepo.findOne({
        where: { workerId: demoWorkerEntity.id, skillId: elecSkill.id },
      });
      if (!existingWsElec) {
        await workerSkillRepo.save(
          workerSkillRepo.create({
            workerId: demoWorkerEntity.id,
            skillId: elecSkill.id,
            proficiencyLevel: ProficiencyLevel.ADVANCED,
            isVerified: true,
          }),
        );
        console.log('Linked verified Electrical skill to Demo Worker');
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
