"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, SlidersHorizontal, Star, Users, Fuel, Gauge, Heart } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { carsService } from "@/lib/api"
import type { Car } from "@/lib/mock-data/cars"

export default function CarsPage() {
  const [priceRange, setPriceRange] = useState([0, 250])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recommended")
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCars() {
      setLoading(true)
      const { data, error } = await carsService.getCars({
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        search: searchQuery,
      })

      if (error) {
        console.error("[v0] Error fetching cars:", error)
      } else if (data) {
        setCars(data)
      }
      setLoading(false)
    }

    fetchCars()
  }, [priceRange, searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="size-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading cars...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold">
              DriveNow
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/cars" className="text-sm font-medium text-accent">
                Browse Cars
              </Link>
              <Link href="/deals" className="text-sm font-medium hover:text-accent transition-colors">
                Deals
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-accent transition-colors">
                How it Works
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings">My Bookings</Link>
            </Button>
            <UserNav />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Available Cars</h1>
          <p className="text-muted-foreground text-lg">Find your perfect ride from our premium collection</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              placeholder="Search by car name or brand..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="md:hidden bg-transparent">
                  <SlidersHorizontal className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Refine your search results</SheetDescription>
                </SheetHeader>
                <FilterContent priceRange={priceRange} setPriceRange={setPriceRange} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-64 shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-6">Filters</h3>
                <FilterContent priceRange={priceRange} setPriceRange={setPriceRange} />
              </CardContent>
            </Card>
          </aside>

          {/* Car Grid */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-muted-foreground">Showing {cars.length} vehicles</div>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {cars.map((car) => (
                <Link href={`/cars/${car.id}`} key={car.id}>
                  <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer h-full">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={car.image || "/placeholder.svg"}
                        alt={car.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-4 right-4 size-9 rounded-full"
                        onClick={(e) => {
                          e.preventDefault()
                          console.log("[v0] Added to favorites:", car.name)
                        }}
                      >
                        <Heart className="size-4" />
                      </Button>
                      <Badge className="absolute top-4 left-4 bg-card text-card-foreground border">
                        {car.category}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1 group-hover:text-accent transition-colors">
                            {car.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Star className="size-3.5 fill-accent text-accent mr-1" />
                              {car.rating}
                            </div>
                            <span>({car.reviews} reviews)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="size-4" />
                          {car.specs.seats}
                        </div>
                        <div className="flex items-center gap-1">
                          <Gauge className="size-4" />
                          {car.specs.transmission}
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel className="size-4" />
                          {car.specs.fuel}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <div className="text-2xl font-bold">${car.price}</div>
                          <div className="text-xs text-muted-foreground">per day</div>
                        </div>
                        <Button size="sm">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterContent({
  priceRange,
  setPriceRange,
}: {
  priceRange: number[]
  setPriceRange: (value: number[]) => void
}) {
  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-medium">Price per day</Label>
          <span className="text-sm text-muted-foreground">
            ${priceRange[0]} - ${priceRange[1]}
          </span>
        </div>
        <Slider value={priceRange} onValueChange={setPriceRange} max={250} step={10} className="w-full" />
      </div>

      {/* Car Type */}
      <div className="space-y-3">
        <Label className="font-medium">Car Type</Label>
        <div className="space-y-2">
          {["Sedan", "SUV", "Sports Car", "Electric", "Luxury"].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox id={type} />
              <label
                htmlFor={type}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div className="space-y-3">
        <Label className="font-medium">Transmission</Label>
        <div className="space-y-2">
          {["Automatic", "Manual"].map((trans) => (
            <div key={trans} className="flex items-center space-x-2">
              <Checkbox id={trans} />
              <label
                htmlFor={trans}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {trans}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Fuel Type */}
      <div className="space-y-3">
        <Label className="font-medium">Fuel Type</Label>
        <div className="space-y-2">
          {["Electric", "Gasoline", "Hybrid", "Diesel"].map((fuel) => (
            <div key={fuel} className="flex items-center space-x-2">
              <Checkbox id={fuel} />
              <label
                htmlFor={fuel}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {fuel}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Seats */}
      <div className="space-y-3">
        <Label className="font-medium">Seats</Label>
        <div className="space-y-2">
          {["2 seats", "4-5 seats", "6-7 seats", "8+ seats"].map((seat) => (
            <div key={seat} className="flex items-center space-x-2">
              <Checkbox id={seat} />
              <label
                htmlFor={seat}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {seat}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full bg-transparent" variant="outline">
        Reset Filters
      </Button>
    </div>
  )
}
