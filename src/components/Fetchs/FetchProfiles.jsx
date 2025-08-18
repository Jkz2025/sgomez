import React from 'react'
import { supabase } from '../Functions/CreateClient'

export async function fetchProfiles() {
    const { data, error } = await supabase.from("profiles").select("*")
    if (error) {    
        throw new Error(error.message)
    }
    return data
}