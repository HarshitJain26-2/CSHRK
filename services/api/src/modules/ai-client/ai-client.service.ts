import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { IBookingCandidate } from '@cshrk/types';
import { AIInferenceLogEntity, AIModelVersionEntity } from '../../database/entities';

@Injectable()
export class AIClientService {
  private readonly logger = new Logger(AIClientService.name);
  private readonly aiBaseUrl: string;
  private readonly timeoutMs: number;

  constructor(
    @InjectRepository(AIInferenceLogEntity)
    private readonly inferenceLogRepo: Repository<AIInferenceLogEntity>,
    @InjectRepository(AIModelVersionEntity)
    private readonly modelVersionRepo: Repository<AIModelVersionEntity>,
  ) {
    this.aiBaseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000/api/v1/ai';
    this.timeoutMs = parseInt(process.env.AI_SERVICE_TIMEOUT_MS || '3000', 10);
  }

  private hashInput(payload: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }

  async matchWorkers(
    serviceRequestId: string,
    requiredSkillIds: string[],
    latitude: number,
    longitude: number,
    maxDistanceKm: number,
    eligibleCandidates: IBookingCandidate[],
  ): Promise<IBookingCandidate[]> {
    const startTime = Date.now();
    const inputHash = this.hashInput({ serviceRequestId, requiredSkillIds, latitude, longitude, maxDistanceKm });

    const aiPayload = {
      service_request_id: serviceRequestId,
      required_skill_ids: requiredSkillIds,
      latitude,
      longitude,
      max_distance_km: maxDistanceKm,
      limit: eligibleCandidates.length,
      candidates: eligibleCandidates.map((c) => ({
        worker_id: c.workerId,
        cooperative_id: 'coop-active',
        has_verified_skill: true,
        has_mandatory_cert: true,
        is_available: true,
        coop_active: true,
        distance_km: c.distanceKm,
        rating_avg: c.ratingAvg,
        total_jobs: c.totalJobs,
        current_active_jobs: 0,
        proficiency_level: c.proficiencyLevel || 'INTERMEDIATE',
      })),
    };

    try {
      const response = await axios.post(`${this.aiBaseUrl}/matching`, aiPayload, {
        timeout: this.timeoutMs,
      });

      const latencyMs = Date.now() - startTime;
      const aiCandidates = response.data?.candidates || [];

      // Log privacy-preserving inference log
      await this.inferenceLogRepo.save(
        this.inferenceLogRepo.create({
          taskType: 'MATCHING',
          modelVersion: response.data?.algorithm_version || 'cshrk-match-v1.2.0',
          inputHash,
          outputSummary: { candidateCount: aiCandidates.length },
          latencyMs,
          fallbackUsed: false,
        }),
      );

      // Re-map candidates in AI ranked order
      const candidateMap = new Map(eligibleCandidates.map((c) => [c.workerId, c]));
      const rankedList: IBookingCandidate[] = [];

      for (const ac of aiCandidates) {
        const original = candidateMap.get(ac.worker_id);
        if (original) {
          rankedList.push({
            ...original,
            matchScore: ac.match_score,
            explanations: ac.explanations,
          });
        }
      }

      return rankedList.length > 0 ? rankedList : eligibleCandidates;
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      this.logger.warn(
        `AI matching unavailable or timed out (${latencyMs}ms): ${err.message}. Engaging deterministic PostGIS fallback.`,
      );

      // Fallback: deterministic ranking with PostGIS geodesic distance & ratings
      const fallbackRanked = [...eligibleCandidates].sort((a, b) => {
        const scoreA = (1.0 / (1.0 + 0.1 * a.distanceKm)) * 0.5 + (a.ratingAvg / 5.0) * 0.5;
        const scoreB = (1.0 / (1.0 + 0.1 * b.distanceKm)) * 0.5 + (b.ratingAvg / 5.0) * 0.5;
        return scoreB - scoreA;
      });

      const enrichedFallback = fallbackRanked.map((c) => {
        const score = Math.round(((1.0 / (1.0 + 0.1 * c.distanceKm)) * 0.5 + (c.ratingAvg / 5.0) * 0.5) * 100) / 100;
        return {
          ...c,
          matchScore: score,
          explanations: [
            'Verified trade skill certification (PostGIS geodesic filter)',
            `${c.distanceKm} km from service location`,
            `Rated ${c.ratingAvg}/5.0 across ${c.totalJobs} jobs`,
            'Deterministic fallback matching applied',
          ],
        };
      });

      await this.inferenceLogRepo.save(
        this.inferenceLogRepo.create({
          taskType: 'MATCHING',
          modelVersion: 'postgis-deterministic-fallback',
          inputHash,
          outputSummary: { candidateCount: enrichedFallback.length, fallbackReason: err.message },
          latencyMs,
          fallbackUsed: true,
        }),
      );

      return enrichedFallback;
    }
  }

  async getDemandForecast(
    districtCode: string,
    category: string,
    forecastDaysAhead = 7,
    history?: Array<{ date: string; request_count: number }>,
  ) {
    const startTime = Date.now();
    const inputHash = this.hashInput({ districtCode, category, forecastDaysAhead, count: history?.length });

    try {
      const response = await axios.post(
        `${this.aiBaseUrl}/demand-forecast`,
        {
          district_code: districtCode,
          category,
          forecast_days_ahead: forecastDaysAhead,
          history,
        },
        { timeout: this.timeoutMs },
      );

      const latencyMs = Date.now() - startTime;
      await this.inferenceLogRepo.save(
        this.inferenceLogRepo.create({
          taskType: 'FORECASTING',
          modelVersion: response.data?.model_version || 'cshrk-demand-hw-v1.0.0',
          inputHash,
          outputSummary: { status: response.data?.status, predictionCount: response.data?.predictions?.length },
          latencyMs,
          fallbackUsed: false,
        }),
      );

      return response.data;
    } catch (err: any) {
      this.logger.warn(`AI forecasting error: ${err.message}`);
      return {
        district_code: districtCode,
        category,
        status: 'INSUFFICIENT_DATA',
        predictions: [],
        model_version: 'cshrk-demand-hw-v1.0.0',
        evaluation_metrics: null,
        notes: `AI forecasting service error or timeout: ${err.message}`,
      };
    }
  }

  async getWorkforceAllocation(
    cooperativeId: string,
    targetDate: string,
    jobs: any[],
    workers: any[],
  ) {
    const startTime = Date.now();
    const inputHash = this.hashInput({ cooperativeId, targetDate, jobCount: jobs.length, workerCount: workers.length });

    try {
      const response = await axios.post(
        `${this.aiBaseUrl}/workforce-allocation`,
        {
          cooperative_id: cooperativeId,
          target_date: targetDate,
          jobs,
          workers,
        },
        { timeout: this.timeoutMs },
      );

      const latencyMs = Date.now() - startTime;
      await this.inferenceLogRepo.save(
        this.inferenceLogRepo.create({
          taskType: 'ALLOCATION',
          modelVersion: response.data?.optimization_engine || 'cshrk-alloc-bipartite-v1.0.0',
          inputHash,
          outputSummary: {
            assigned: response.data?.assignments?.length,
            unassigned: response.data?.unassigned_jobs?.length,
          },
          latencyMs,
          fallbackUsed: false,
        }),
      );

      return response.data;
    } catch (err: any) {
      this.logger.warn(`AI allocation error: ${err.message}`);
      throw err;
    }
  }

  async getSkillGapAnalysis(districtCode: string, lookbackDays = 30, tradeData: any[]) {
    const startTime = Date.now();
    const inputHash = this.hashInput({ districtCode, lookbackDays, tradeCount: tradeData.length });

    try {
      const response = await axios.post(
        `${this.aiBaseUrl}/skill-gap`,
        {
          district_code: districtCode,
          lookback_days: lookbackDays,
          trade_data: tradeData,
        },
        { timeout: this.timeoutMs },
      );

      const latencyMs = Date.now() - startTime;
      await this.inferenceLogRepo.save(
        this.inferenceLogRepo.create({
          taskType: 'SKILL_GAP',
          modelVersion: response.data?.analysis_engine || 'cshrk-skillgap-v1.0.0',
          inputHash,
          outputSummary: { deficitCount: response.data?.deficits?.length },
          latencyMs,
          fallbackUsed: false,
        }),
      );

      return response.data;
    } catch (err: any) {
      this.logger.warn(`AI skill gap analysis error: ${err.message}`);
      throw err;
    }
  }

  async listModels() {
    try {
      const response = await axios.get(`${this.aiBaseUrl}/models`, { timeout: this.timeoutMs });
      return response.data;
    } catch {
      // Return static registered models if AI is offline
      return [
        {
          model_name: 'CSHRK Worker Matching Ranker',
          version: 'cshrk-match-v1.2.0',
          task_type: 'MATCHING',
          status: 'ACTIVE',
        },
        {
          model_name: 'CSHRK Holt-Winters Demand Forecaster',
          version: 'cshrk-demand-hw-v1.0.0',
          task_type: 'FORECASTING',
          status: 'ACTIVE',
        },
        {
          model_name: 'CSHRK Constrained Workforce Allocator',
          version: 'cshrk-alloc-bipartite-v1.0.0',
          task_type: 'ALLOCATION',
          status: 'ACTIVE',
        },
        {
          model_name: 'CSHRK Regional Skill Gap Analyzer',
          version: 'cshrk-skillgap-v1.0.0',
          task_type: 'SKILL_GAP',
          status: 'ACTIVE',
        },
      ];
    }
  }

  async getInferenceLogs(limit = 50) {
    return this.inferenceLogRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
