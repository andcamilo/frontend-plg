import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function TramitesPopulares({ 
  tramites,
  title = "Trámites Populares" 
}) {
  return (
    <div className="w-full bg-[#1C1C1C] px-4 py-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-3xl font-bold text-white">{title}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {tramites.map((tramite: any) => (
            <Link
              key={tramite.title}
              href={tramite.redirect}
              className="group relative overflow-hidden rounded-lg"
            >
              <div className="aspect-[4/3] w-full">
                <Image
                  src={tramite.imageUrl || "/placeholder.svg"}
                  alt={tramite.title}
                  fill
                  className="object-cover brightness-80 transition-all duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-6">
                <h3 className="text-xl font-medium text-white">{tramite.title}</h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B0228C] text-white transition-transform duration-300 group-hover:translate-x-2">
                  <ChevronRight className="h-6 w-6" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

