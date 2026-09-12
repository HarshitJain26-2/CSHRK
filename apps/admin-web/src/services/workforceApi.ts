import { apiClient } from '../context/AuthContext';
import {
  WorkerRecord,
  SkillRecord,
  CertificationRecord,
  CooperativeRecord,
} from '../data/workforceData';

export const workforceApi = {
  // Workers
  async getWorkers(query?: { search?: string; cooperativeId?: string; availabilityStatus?: string }) {
    return apiClient.get('/workers', { params: query });
  },

  async getWorkerById(id: string) {
    return apiClient.get(`/workers/${id}`);
  },

  async createWorker(data: Partial<WorkerRecord>) {
    return apiClient.post('/workers', {
      cooperativeId: data.cooperativeId,
      fullName: data.fullName,
      memberId: data.id,
      employmentType: data.employmentType === 'Full-Time' ? 'MEMBER_WORKER' : 'CONTRACT_WORKER',
    });
  },

  async updateWorker(id: string, updates: Partial<WorkerRecord>) {
    return apiClient.patch(`/workers/${id}`, updates);
  },

  async updateWorkerStatus(id: string, availabilityStatus: string) {
    return apiClient.patch(`/workers/${id}/status`, { availabilityStatus });
  },

  // Skills
  async getSkills(category?: string, search?: string) {
    return apiClient.get('/skills', { params: { category, search } });
  },

  async getSkillById(id: string) {
    return apiClient.get(`/skills/${id}`);
  },

  async createSkill(data: Partial<SkillRecord>) {
    return apiClient.post('/skills', {
      name: data.name,
      code: data.code,
      category: data.category,
      description: data.description,
    });
  },

  async updateSkill(id: string, updates: Partial<SkillRecord>) {
    return apiClient.patch(`/skills/${id}`, updates);
  },

  async deleteSkill(id: string) {
    return apiClient.delete(`/skills/${id}`);
  },

  async assignSkill(skillId: string, workerId: string, proficiencyLevel: string) {
    return apiClient.post(`/skills/${skillId}/assign`, { workerId, proficiencyLevel });
  },

  async removeSkill(skillId: string, workerId: string) {
    return apiClient.delete(`/skills/${skillId}/assign/${workerId}`);
  },

  // Certifications
  async getCertifications(status?: string, workerId?: string, search?: string) {
    return apiClient.get('/certifications', { params: { status, workerId, search } });
  },

  async getCertificationById(id: string) {
    return apiClient.get(`/certifications/${id}`);
  },

  async createCertification(data: Partial<CertificationRecord>) {
    return apiClient.post('/certifications', {
      workerId: data.workerId,
      certificationName: data.certificationName,
      issuingOrganization: data.issuingOrganization,
      credentialNumber: data.credentialNumber,
      issueDate: data.issueDate,
      expiryDate: data.expiryDate,
      status: data.status,
    });
  },

  async updateCertification(id: string, updates: Partial<CertificationRecord>) {
    return apiClient.patch(`/certifications/${id}`, updates);
  },

  async verifyCertification(id: string, status: 'valid' | 'rejected', notes?: string) {
    return apiClient.patch(`/certifications/${id}/verify`, {
      status: status === 'valid' ? 'valid' : 'rejected',
      verificationNotes: notes,
    });
  },

  async renewCertification(id: string, newExpiryDate: string) {
    return apiClient.patch(`/certifications/${id}/renew`, { newExpiryDate });
  },

  // Cooperatives
  async getCooperatives(district?: string, search?: string) {
    return apiClient.get('/cooperatives', { params: { district, search } });
  },

  async getCooperativeById(id: string) {
    return apiClient.get(`/cooperatives/${id}`);
  },

  async createCooperative(data: Partial<CooperativeRecord>) {
    return apiClient.post('/cooperatives', {
      federationId: 'fed-apex-01',
      name: data.name,
      registrationNumber: data.registrationNumber || `REG-${Date.now()}`,
      district: (data as any).district || data.region || 'New Delhi',
      contactEmail: data.contactEmail || 'coop@cshrk.local',
      contactPhone: data.contactPhone,
    });
  },

  async updateCooperative(id: string, updates: Partial<CooperativeRecord>) {
    return apiClient.patch(`/cooperatives/${id}`, updates);
  },

  async getCooperativeMembers(id: string) {
    return apiClient.get(`/cooperatives/${id}/members`);
  },

  async updateAffiliation(coopId: string, workerId: string, targetCooperativeId?: string) {
    return apiClient.patch(`/cooperatives/${coopId}/affiliation/${workerId}`, {
      targetCooperativeId,
    });
  },

  // Dashboard Metrics
  async getDashboardMetrics() {
    return apiClient.get('/workers/dashboard/metrics');
  },
};
