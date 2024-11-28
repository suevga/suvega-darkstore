import React from 'react'
import { Card } from '../components/ui/card.tsx'
import { UserProfile, useUser } from '@clerk/clerk-react'

export default function ProfilePage() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Profile</h1>
      <Card className="max-w-2xl">
          <UserProfile/>
      </Card>
    </>
  )
}

