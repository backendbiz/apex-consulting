import { cn } from '@/utils/cn'
import Image from 'next/image'

interface Client {
  name: string
  logo: string
}

interface ClientsProps {
  title?: string
  clients: Client[]
  className?: string
}

export function Clients({
  title = 'Trusted By Industry Leaders',
  clients,
  className,
}: ClientsProps) {
  if (clients.length === 0) return null

  return (
    <section className={cn('section bg-white', className)}>
      <div className="container">
        {title && (
          <h2 className="mb-12 text-center text-xl font-semibold text-gray-400 uppercase tracking-wider">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-3 lg:grid-cols-6">
          {clients.map((client, index) => (
            <div
              key={index}
              className="flex items-center justify-center opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            >
              <Image
                src={client.logo}
                alt={client.name}
                width={150}
                height={60}
                className="max-h-12 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
