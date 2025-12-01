import { supabase, isMockedSupabase } from './supabaseClient'

type MockUser = {
  id: string
  email: string
}

const MOCK_STORAGE_KEY = 'tanchoice_mock_session'

const createMockSession = (email: string) => {
  const user: MockUser = {
    id: 'mock-user',
    email,
  }
  const session = { user }
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(session))
  return session
}

const getMockSession = () => {
  const raw = localStorage.getItem(MOCK_STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

const clearMockSession = () => {
  localStorage.removeItem(MOCK_STORAGE_KEY)
}

export const signIn = async (email: string, password: string) => {
  if (isMockedSupabase) {
    const session = createMockSession(email || 'demo@tanchoice.com')
    return { data: { session }, error: null }
  }
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
  return { data, error }
}

export const signOut = async () => {
  if (isMockedSupabase) {
    clearMockSession()
    return { error: null }
  }
  const { error } = await supabase!.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  if (isMockedSupabase) {
    return getMockSession()?.user || null
  }
  const { data: { user } } = await supabase!.auth.getUser()
  return user
}

export const getSession = async () => {
  if (isMockedSupabase) {
    return getMockSession()
  }
  const { data: { session } } = await supabase!.auth.getSession()
  return session
}

