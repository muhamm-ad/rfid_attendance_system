// @/components/persons-primary-buttons.tsx

import { Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { usePersons } from '@/hooks/use-persons'

export function PersonsPrimaryButtons() {
  const { setOpen } = usePersons()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  if (!isAdmin) return null

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('add')}
      >
        <span>Add Person</span> <Plus size={18} />
      </Button>
    </div>
  )
}
