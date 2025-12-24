import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authAPI } from './auth.api'
import { useAuthStore } from '@renderer/stores'
import type { LoginFormValues, RegisterFormValues } from './types'
import type { User } from '@sdk/types/models'

/**
 * 登录 Mutation Hook
 */
export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)
  const setError = useAuthStore((state) => state.setError)

  return useMutation({
    mutationFn: async (values: LoginFormValues): Promise<User> => {
      return authAPI.login(values.username, values.password)
    },
    onMutate: () => {
      setError(null)
    },
    onSuccess: (user) => {
      setAuth(user)
      // 更新查询缓存
      queryClient.setQueryData(['auth', 'currentUser'], user)
      // 跳转到应用首页
      navigate({ to: '/chats' })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '登录失败'
      setError(message)
    }
  })
}

/**
 * 注册 Mutation Hook
 */
export function useRegister() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)
  const setError = useAuthStore((state) => state.setError)

  return useMutation({
    mutationFn: async (values: RegisterFormValues): Promise<User> => {
      return authAPI.register(values.username, values.displayName, values.password)
    },
    onMutate: () => {
      setError(null)
    },
    onSuccess: (user) => {
      setAuth(user)
      // 更新查询缓存
      queryClient.setQueryData(['auth', 'currentUser'], user)
      // 跳转到应用首页
      navigate({ to: '/chats' })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '注册失败'
      setError(message)
    }
  })
}
