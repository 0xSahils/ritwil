import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../api/client'

export const useSuperAdminDashboard = () => {
  return useQuery({
    queryKey: ['superAdminDashboard'],
    queryFn: async () => {
      const response = await apiRequest('/dashboard/super-admin')
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load teams')
      }
      const data = await response.json()

      // Process data as in the original component
      const mappedTeams = (data.teams || []).map((team) => ({
        ...team,
        teamTarget: Number(team.teamTarget || 0),
        targetAchieved: Number(team.targetAchieved || 0),
        teamLeads: (team.teamLeads || []).map((lead) => ({
          ...lead,
          target: Number(lead.target || 0),
          targetAchieved: Number(lead.targetAchieved || 0),
          members: (lead.members || []).map((member) => ({
            ...member,
            target: Number(member.target || 0),
            targetAchieved: Number(member.targetAchieved || 0),
          })),
        })),
      }))

      return {
        superUser: data.superUser,
        summary: data.summary,
        teams: mappedTeams,
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  })
}

export const useTeamLeadDashboard = () => {
  return useQuery({
    queryKey: ['teamLeadDashboard'],
    queryFn: async () => {
      const response = await apiRequest('/dashboard/team-lead')
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load team lead data')
      }
      const data = await response.json()

      const mapMember = (m) => ({
        ...m,
        target: Number(m.target || 0),
        targetAchieved: Number(m.targetAchieved || 0),
        members: (m.members || []).map(mapMember)
      })

      const mappedMembers = (data.members || []).map(mapMember)

      const lead = {
        id: data.lead.id,
        name: data.lead.name,
        level: data.lead.level || 'L2',
        target: Number(data.lead.target || 0),
        targetAchieved: Number(data.lead.targetAchieved || 0),
        targetType: data.lead.targetType,
        totalRevenue: data.lead.totalRevenue,
        totalPlacements: data.lead.totalPlacements,
        members: mappedMembers,
      }

      const team = {
        id: data.team.id,
        name: data.team.name,
        color: data.team.color || 'blue',
        teamTarget: Number(data.team.teamTarget || 0),
        targetAchieved: Number(data.lead.targetAchieved || 0),
        teamLeads: [lead],
      }

      return { team, lead }
    },
    staleTime: 1000 * 60 * 5,
  })
}

/** Head placements for Super User: team or personal, with filters (teamId, leadId, year, placementType, source). */
export const useHeadPlacements = (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.teamId) params.set('teamId', filters.teamId)
  if (filters.leadId) params.set('leadId', filters.leadId)
  if (filters.year != null && filters.year !== '' && filters.year !== 'all') params.set('year', String(filters.year))
  if (filters.placementType) params.set('placementType', filters.placementType)
  if (filters.source) params.set('source', filters.source)
  const queryString = params.toString()

  return useQuery({
    queryKey: ['headPlacements', filters],
    queryFn: async () => {
      const url = `/dashboard/head-placements${queryString ? `?${queryString}` : ''}`
      const response = await apiRequest(url)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load placements')
      }
      return response.json()
    },
    staleTime: 1000 * 60 * 2,
  })
}
