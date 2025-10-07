"use client"
import { useCallback } from "react"

export function useToast() {
  const toast = useCallback(({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
   
    console.log("TOAST:", title, description, variant)
   
    try {
    
      alert(`${title}${description ? ' - ' + description : ''}`)
    } catch (e) {
     
    }
  }, [])

  return { toast }
}
