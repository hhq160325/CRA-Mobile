"use client"
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  variant?: string
  size?: string
}

export function Button({ children, className = '', variant, size, ...rest }: ButtonProps) {
  
  return (
    <button {...rest} className={`px-4 py-2 rounded-md bg-primary text-white ${className}`}> 
      {children}
    </button>
  )
}
