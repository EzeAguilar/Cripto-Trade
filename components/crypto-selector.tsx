"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

interface CryptoSelectorProps {
  availablePairs: string[]
  selectedCrypto: string
  onCryptoChange: (crypto: string) => void
  isLoading: boolean
}

export default function CryptoSelector({
  availablePairs,
  selectedCrypto,
  onCryptoChange,
  isLoading,
}: CryptoSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPairs, setFilteredPairs] = useState<string[]>([])

  useEffect(() => {
    if (availablePairs && availablePairs.length > 0) {
      setFilteredPairs(availablePairs.filter((pair) => pair.toLowerCase().includes(searchTerm.toLowerCase())))
    }
  }, [searchTerm, availablePairs])

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search cryptocurrencies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {filteredPairs.length > 0 ? (
            filteredPairs.map((pair) => (
              <Button
                key={pair}
                variant={selectedCrypto === pair ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => onCryptoChange(pair)}
              >
                {pair}
              </Button>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No cryptocurrencies found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

