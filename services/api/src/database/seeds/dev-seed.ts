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
  MembershipStatus,
  ContractStatus,
  ProjectStatus,
  JobStatus,
  RequirementStatus,
  TeamStatus,
  TeamMemberRole,
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

    // 7. Phase 3: Seed Explicit Cooperative & Federation Memberships
    const coopMemberRepo = seedDataSource.getRepository(entities.CooperativeMembershipEntity);
    const fedMemberRepo = seedDataSource.getRepository(entities.FederationMembershipEntity);

    const coopAdminUser = await userRepo.findOne({ where: { email: 'dev_coop@cshrk.local' } });
    if (coopAdminUser) {
      const existingCoopMember = await coopMemberRepo.findOne({
        where: { userId: coopAdminUser.id, cooperativeId: cooperative.id },
      });
      if (!existingCoopMember) {
        await coopMemberRepo.save(
          coopMemberRepo.create({
            userId: coopAdminUser.id,
            cooperativeId: cooperative.id,
            role: 'COOPERATIVE_ADMIN',
            status: MembershipStatus.ACTIVE,
          }),
        );
        console.log('Seeded CooperativeMembership for Demo Coop Admin');
      }
    }

    const fedAdminUser = await userRepo.findOne({ where: { email: 'dev_fed@cshrk.local' } });
    if (fedAdminUser) {
      const existingFedMember = await fedMemberRepo.findOne({
        where: { userId: fedAdminUser.id, federationId: federation.id },
      });
      if (!existingFedMember) {
        await fedMemberRepo.save(
          fedMemberRepo.create({
            userId: fedAdminUser.id,
            federationId: federation.id,
            role: 'FEDERATION_ADMIN',
            status: MembershipStatus.ACTIVE,
          }),
        );
        console.log('Seeded FederationMembership for Demo Federation Admin');
      }
    }

    const workerUser = await userRepo.findOne({ where: { email: 'dev_worker@cshrk.local' } });
    if (workerUser && demoWorkerEntity) {
      const existingWorkerMember = await coopMemberRepo.findOne({
        where: { userId: workerUser.id, cooperativeId: cooperative.id },
      });
      if (!existingWorkerMember) {
        await coopMemberRepo.save(
          coopMemberRepo.create({
            userId: workerUser.id,
            cooperativeId: cooperative.id,
            workerId: demoWorkerEntity.id,
            memberId: 'MEM-2026-001',
            role: 'MEMBER_WORKER',
            status: MembershipStatus.ACTIVE,
          }),
        );
        console.log('Seeded CooperativeMembership for Demo Worker');
      }
    }

    // 8. Phase 3: Seed Second Cooperative (South Delhi) & Member Worker for Multi-Coop Testing
    let secondCoop = await coopRepo.findOne({ where: { registrationNumber: 'COOP-SD-002' } });
    if (!secondCoop) {
      secondCoop = await coopRepo.save(
        coopRepo.create({
          federationId: federation.id,
          name: 'South Delhi Trades & Services Society',
          registrationNumber: 'COOP-SD-002',
          district: 'South Delhi',
          contactEmail: 'contact@southdelhitrades.local',
          contactPhone: '+911188776655',
          status: AccountStatus.ACTIVE,
        }),
      );
      console.log('Created Second Seed Cooperative: South Delhi Trades & Services Society');
    }

    let secondWorkerUser = await userRepo.findOne({ where: { email: 'worker_sd@cshrk.local' } });
    let secondWorkerEntity: entities.WorkerEntity | null = null;
    if (!secondWorkerUser) {
      secondWorkerUser = await userRepo.save(
        userRepo.create({
          email: 'worker_sd@cshrk.local',
          fullName: 'Rajesh Kumar (South Delhi)',
          passwordHash: defaultPassword,
          role: UserRole.WORKER,
          status: AccountStatus.ACTIVE,
        }),
      );
      secondWorkerEntity = await workerRepo.save(
        workerRepo.create({
          userId: secondWorkerUser.id,
          cooperativeId: secondCoop.id,
          fullName: secondWorkerUser.fullName,
          memberId: 'MEM-SD-001',
          employmentType: WorkerEmploymentType.MEMBER_WORKER,
          status: AccountStatus.ACTIVE,
          availabilityStatus: WorkerAvailabilityStatus.AVAILABLE,
          ratingAvg: 4.8,
          totalJobs: 12,
          currentLocation: {
            type: 'Point',
            coordinates: [77.2273, 28.5355], // South Delhi
          },
        }),
      );
      await coopMemberRepo.save(
        coopMemberRepo.create({
          userId: secondWorkerUser.id,
          cooperativeId: secondCoop.id,
          workerId: secondWorkerEntity.id,
          memberId: 'MEM-SD-001',
          role: 'MEMBER_WORKER',
          status: MembershipStatus.ACTIVE,
        }),
      );
      if (elecSkill) {
        await workerSkillRepo.save(
          workerSkillRepo.create({
            workerId: secondWorkerEntity.id,
            skillId: elecSkill.id,
            proficiencyLevel: ProficiencyLevel.EXPERT,
            isVerified: true,
          }),
        );
      }
      console.log('Seeded Second Worker & Membership in South Delhi Cooperative');
    }

    // 9. Phase 3: Seed Teams, Contracts, Projects, and Large Jobs
    const teamRepo = seedDataSource.getRepository(entities.WorkerTeamEntity);
    const teamMemberRepo = seedDataSource.getRepository(entities.TeamMemberEntity);
    const contractRepo = seedDataSource.getRepository(entities.ContractEntity);
    const projectRepo = seedDataSource.getRepository(entities.ProjectEntity);
    const jobRepo = seedDataSource.getRepository(entities.LargeJobEntity);
    const reqRepo = seedDataSource.getRepository(entities.WorkforceRequirementEntity);

    let contract = await contractRepo.findOne({ where: { contractNumber: 'CNT-2026-001' } });
    if (!contract) {
      contract = await contractRepo.save(
        contractRepo.create({
          contractNumber: 'CNT-2026-001',
          title: 'Municipal Facility Maintenance Framework',
          clientName: 'Municipal Corporation of Delhi',
          clientContact: 'facilities@mcd.gov.in',
          cooperativeId: cooperative.id,
          federationId: federation.id,
          scope: 'Comprehensive electrical, plumbing, and facility maintenance across Delhi public buildings.',
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 3600 * 1000),
          status: ContractStatus.ACTIVE,
        }),
      );
      console.log('Created Seed Contract: CNT-2026-001');
    }

    let project = await projectRepo.findOne({ where: { title: 'Civic Center Electrical Overhaul' } });
    if (!project) {
      project = await projectRepo.save(
        projectRepo.create({
          contractId: contract.id,
          cooperativeId: cooperative.id,
          title: 'Civic Center Electrical Overhaul',
          description: 'Emergency wiring, breaker replacement, and energy audit across Blocks A-C.',
          startDate: new Date(),
          endDate: new Date(Date.now() + 45 * 24 * 3600 * 1000),
          status: ProjectStatus.IN_PROGRESS,
          address: 'MCD Civic Centre, Minto Road, New Delhi 110002',
          location: {
            type: 'Point',
            coordinates: [77.2272, 28.6369],
          },
        }),
      );
      console.log('Created Seed Project: Civic Center Electrical Overhaul');
    }

    let team = await teamRepo.findOne({ where: { name: 'Delhi Alpha Electrical Crew' } });
    if (!team && demoWorkerEntity) {
      team = await teamRepo.save(
        teamRepo.create({
          cooperativeId: cooperative.id,
          name: 'Delhi Alpha Electrical Crew',
          description: 'Certified rapid response team for commercial switchboard and commercial wiring.',
          leaderWorkerId: demoWorkerEntity.id,
          projectId: project.id,
          status: TeamStatus.ACTIVE,
        }),
      );
      await teamMemberRepo.save(
        teamMemberRepo.create({
          teamId: team.id,
          workerId: demoWorkerEntity.id,
          role: TeamMemberRole.LEADER,
        }),
      );
      console.log('Created Seed Team: Delhi Alpha Electrical Crew with Leader');
    }

    let largeJob = await jobRepo.findOne({ where: { title: 'Civic Center Distribution Rewiring' } });
    if (!largeJob && elecSkill) {
      largeJob = await jobRepo.save(
        jobRepo.create({
          projectId: project.id,
          cooperativeId: cooperative.id,
          title: 'Civic Center Distribution Rewiring',
          organizationName: 'Municipal Corporation of Delhi',
          skillId: elecSkill.id,
          requiredWorkers: 4,
          assignedWorkers: 1,
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 3600 * 1000),
          status: JobStatus.OPEN,
          address: 'Block B, Civic Center, New Delhi',
          location: {
            type: 'Point',
            coordinates: [77.2272, 28.6369],
          },
        }),
      );
      console.log('Created Seed Large Job: Civic Center Distribution Rewiring (Operational, Zero Pricing)');
    }

    let requirement = await reqRepo.findOne({ where: { locationCity: 'Delhi' } });
    if (!requirement && elecSkill) {
      requirement = await reqRepo.save(
        reqRepo.create({
          contractId: contract.id,
          projectId: project.id,
          skillId: elecSkill.id,
          quantity: 6,
          fulfilledQuantity: 2,
          locationCity: 'Delhi',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          status: RequirementStatus.PARTIALLY_FULFILLED,
        }),
      );
      console.log('Created Seed Workforce Requirement: 6 Certified Electricians');
    }


    console.log('================================================================');
    console.log('  SEED COMPLETE: Phase 0, 1, 2, and 3 test data ready');
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
