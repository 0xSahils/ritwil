import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '../api/client'

export const useTeams = () => {
  const queryClient = useQueryClient()

  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await apiRequest('/teams')
      if (!response.ok) throw new Error('Failed to fetch teams')
      const data = await response.json()
      return Array.isArray(data) ? data : []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const createTeamMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await apiRequest('/teams', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create team')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teams'])
    },
  })

  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId) => {
      const response = await apiRequest(`/teams/${teamId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete team')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teams'])
    },
  })

  return {
    teams: teamsQuery.data,
    isLoading: teamsQuery.isLoading,
    error: teamsQuery.error,
    createTeam: createTeamMutation.mutate,
    isCreating: createTeamMutation.isLoading,
    deleteTeam: deleteTeamMutation.mutate,
    isDeleting: deleteTeamMutation.isLoading,
  }
}

export const useTeamDetails = (teamId) => {
  const queryClient = useQueryClient()

  const teamQuery = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const response = await apiRequest(`/teams/${teamId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch team details (${response.status})`)
      }
      return response.json()
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5,
  })

  const updateTeamMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest(`/teams/${teamId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update team')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team', teamId])
      queryClient.invalidateQueries(['teams'])
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: async ({ userId, type }) => {
      const response = await apiRequest(`/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to remove user')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team', teamId])
    },
  })

  const updateMemberTargetMutation = useMutation({
    mutationFn: async ({ userId, newTarget, newTargetType }) => {
      const response = await apiRequest(`/teams/${teamId}/members/${userId}/target`, {
        method: 'PATCH',
        body: JSON.stringify({
          target: Number(newTarget),
          targetType: newTargetType,
        }),
      })
      if (!response.ok) throw new Error('Failed to update target')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team', teamId])
    },
  })

  return {
    team: teamQuery.data,
    isLoading: teamQuery.isLoading,
    error: teamQuery.error,
    refetch: teamQuery.refetch,
    updateTeam: updateTeamMutation.mutate,
    isUpdating: updateTeamMutation.isLoading,
    removeMember: removeMemberMutation.mutate,
    updateMemberTarget: updateMemberTargetMutation.mutate,
  }
}
