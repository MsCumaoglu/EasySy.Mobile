import apiClient from '../apiClient';

// ── Types (mirroring web profileApi.ts) ─────────────────────────────────────

export interface AdminUserProfile {
  id: string;
  firebaseUid: string;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  email: string | null;
  role: string | null;
  roles: string[];
  preferredLang: string;
  preferredCurrency: string;
  theme: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrgMappingResponse {
  id: string;
  userId: string;
  orgType: string; // 'HOTEL' | 'BUS' | ...
  orgId: string;
  createdAt: string;
}

// ── API Functions ────────────────────────────────────────────────────────────

export const adminService = {
  /**
   * GET /api/v1/profiles/admin/users?page=0&size=50
   */
  getUsers: async (page = 0, size = 50): Promise<AdminUserProfile[]> => {
    return apiClient.get('/api/v1/profiles/admin/users', {
      params: { page, size },
    });
  },

  /**
   * GET /api/v1/profiles/{uid}
   */
  getUserByUid: async (uid: string): Promise<AdminUserProfile> => {
    return apiClient.get(`/api/v1/profiles/${uid}`);
  },

  /**
   * GET /api/v1/profiles/{uid}/roles
   * Returns an array of { role: string } objects → we map to string[]
   */
  getUserRoles: async (uid: string): Promise<string[]> => {
    const data: { role: string }[] = await apiClient.get(
      `/api/v1/profiles/${uid}/roles`,
    );
    return data.map(d => d.role);
  },

  /**
   * PUT /api/v1/profiles/{uid}/roles
   * Assigns a role to a user.
   */
  assignRole: async (uid: string, role: string): Promise<void> => {
    return apiClient.put(`/api/v1/profiles/${uid}/roles`, { role });
  },

  /**
   * DELETE /api/v1/profiles/{uid}/roles/{role}
   * Revokes a role from a user.
   */
  revokeRole: async (uid: string, role: string): Promise<void> => {
    return apiClient.delete(`/api/v1/profiles/${uid}/roles/${role}`);
  },

  /**
   * GET /api/v1/profiles/{uid}/organizations
   */
  getUserOrganizations: async (uid: string): Promise<OrgMappingResponse[]> => {
    return apiClient.get(`/api/v1/profiles/${uid}/organizations`);
  },

  /**
   * DELETE /api/v1/profiles/admin/users/{uid}
   */
  deleteUser: async (uid: string): Promise<void> => {
    return apiClient.delete(`/api/v1/profiles/admin/users/${uid}`);
  },

  /**
   * POST /api/v1/profiles/{uid}/organizations
   * Maps an organization to a user.
   */
  mapOrganization: async (uid: string, orgId: string, orgType: string): Promise<void> => {
    return apiClient.post(`/api/v1/profiles/${uid}/organizations`, {orgId, orgType});
  },

  /**
   * DELETE /api/v1/profiles/{uid}/organizations/{orgId}
   * Removes an org mapping from a user.
   */
  unmapOrganization: async (uid: string, orgId: string): Promise<void> => {
    return apiClient.delete(`/api/v1/profiles/${uid}/organizations/${orgId}`);
  },
};
