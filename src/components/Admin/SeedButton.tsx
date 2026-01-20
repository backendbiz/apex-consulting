'use client'

import React, { useState } from 'react'
import { seedDatabase } from '@/actions/seed'

export const SeedButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  const handleSeed = async () => {
    if (
      !confirm(
        'Are you sure you want to seed the database? This might duplicate content if not handled within the seeder.',
      )
    )
      return

    setLoading(true)
    setMessage('Seeding...')
    setError(false)

    try {
      const result = await seedDatabase()
      if (result.success) {
        setMessage(result.message)
      } else {
        setError(true)
        setMessage(result.message)
      }
    } catch {
      setError(true)
      setMessage('An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        marginBottom: '24px',
        padding: '24px',
        background: 'var(--theme-elevation-100)',
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: '4px',
      }}
    >
      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Seed Database</h3>
      <p style={{ margin: '0 0 16px 0', color: 'var(--theme-elevation-800)' }}>
        Populate the database with initial sample data for Categories, Services, and Pages.
      </p>
      <button
        onClick={handleSeed}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : 'var(--theme-success-500)',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {loading ? 'Seeding...' : 'Seed Content'}
      </button>
      {message && (
        <p
          style={{
            marginTop: '12px',
            marginBottom: 0,
            color: error ? 'var(--theme-error-500)' : 'var(--theme-success-500)',
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}
