import { createSupabaseAdminClient } from './supabase'

export interface User {
  id: string
  username: string
  email: string
  full_name: string
  created_at: string
  updated_at: string
}

export interface Prediction {
  id: string
  user_id: string
  units: number
  predicted_bill: number
  created_at: string
}

// Auth functions
export async function createUserWithAuth(email: string, password: string, userData: { username: string; full_name: string }) {
  const supabase = createSupabaseAdminClient()

  // First check if username is taken
  const { data: existingUser } = await supabase
    .from('users')
    .select('username')
    .eq('username', userData.username)
    .single()

  if (existingUser) {
    throw new Error('Username already exists')
  }

  // Create auth user with admin API (auto-confirmed)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      username: userData.username,
      full_name: userData.full_name,
    }
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('Failed to create user')
  }

  // Create user profile
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      username: userData.username,
      email,
      full_name: userData.full_name,
    })
    .select()
    .single()

  if (profileError) {
    // Clean up auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw new Error('Failed to create user profile')
  }

  return profileData as User
}

export async function signInUser(identifier: string, password: string) {
  const supabase = createSupabaseAdminClient()

  // Check if identifier is email or username
  let email = identifier
  if (!identifier.includes('@')) {
    // It's a username, look up the email
    const { data: userProfile, error: lookupError } = await supabase
      .from('users')
      .select('email')
      .eq('username', identifier)
      .single()

    if (lookupError || !userProfile) {
      throw new Error('Invalid username or password')
    }
    email = userProfile.email
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('Invalid credentials')
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError) {
    throw new Error('User profile not found')
  }

  return profile as User
}

// Prediction functions
export async function createPrediction(userId: string, units: number) {
  const supabase = createSupabaseAdminClient()
  const predictedBill = predictBillCost(units)

  const { data, error } = await supabase
    .from('predictions')
    .insert({
      user_id: userId,
      units,
      predicted_bill: predictedBill,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create prediction')
  }

  return data as Prediction
}

export async function getUserPredictions(userId: string) {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch predictions')
  }

  return data as Prediction[]
}

export async function getAllPredictions() {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch predictions')
  }

  return data as Prediction[]
}

export async function deletePrediction(predictionId: string, userId: string) {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('predictions')
    .delete()
    .eq('id', predictionId)
    .eq('user_id', userId)

  if (error) {
    throw new Error('Failed to delete prediction')
  }

  return true
}

export async function deletePredictionById(predictionId: string) {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('predictions')
    .delete()
    .eq('id', predictionId)

  if (error) {
    throw new Error('Failed to delete prediction')
  }

  return true
}

export async function clearUserPredictions(userId: string) {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('predictions')
    .delete()
    .eq('user_id', userId)

  if (error) {
    throw new Error('Failed to clear predictions')
  }

  return true
}

// Utility function for bill prediction
function predictBillCost(units: number): number {
  const baseRate = 0.22; // $ per kWh
  const seasonalAdjust = Math.sin(units / 150) * 0.05;
  const variableRate = baseRate + seasonalAdjust;
  const noise = (Math.random() - 0.5) * 0.02;
  const predicted = units * (variableRate + noise);
  return Number(Math.max(0, predicted).toFixed(2));
}