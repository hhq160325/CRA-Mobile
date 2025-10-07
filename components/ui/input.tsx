"use client"
import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  return <input {...props} className={`border px-3 py-2 rounded-md w-full ${props.className || ''}`} />
}
