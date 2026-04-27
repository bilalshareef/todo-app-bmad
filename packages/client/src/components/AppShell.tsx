import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[640px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-2xl font-semibold text-near-black">Todos</h1>
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  )
}
