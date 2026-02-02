import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '../api/client'

export const useEmployeeDetails = (employeeId, userRole, currentUserId, year) => {
  return useQuery({
    queryKey: ['employee', employeeId, year],
    queryFn: async () => {
      const isSelf = userRole === 'EMPLOYEE' && (!employeeId || employeeId === currentUserId)
      let endpoint = isSelf
        ? '/dashboard/employee'
        : `/dashboard/employee/${employeeId}`
      
      if (year) {
        endpoint += `?year=${year}`
      }

      const response = await apiRequest(endpoint)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load employee details')
      }
      return response.json()
    },
    enabled: !!employeeId || (userRole === 'EMPLOYEE' && !employeeId),
  })
}

export const useUpdateVbid = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ employeeId, vbid }) => {
      const response = await apiRequest(`/users/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vbid })
      })
      if (!response.ok) throw new Error('Failed to update VBID')
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['employee', variables.employeeId])
    }
  })
}
