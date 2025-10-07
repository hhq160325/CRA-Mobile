"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, MapPin, Shield, ChevronLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const carDetails = {
  id: 1,
  name: "Tesla Model S",
  category: "Electric Luxury",
  price: 120,
  image: "/tesla-model-s-luxury.png",
}

const locations = [
  "Los Angeles International Airport (LAX)",
  "San Francisco Airport (SFO)",
  "Downtown Los Angeles",
  "Santa Monica",
  "Beverly Hills",
]

const addons = [
  { id: "insurance", name: "Premium Insurance", price: 25, description: "Full coverage with zero deductible" },
  { id: "gps", name: "GPS Navigation", price: 10, description: "Latest navigation system" },
  { id: "child-seat", name: "Child Safety Seat", price: 15, description: "For children 2-7 years" },
  { id: "driver", name: "Additional Driver", price: 20, description: "Add another authorized driver" },
]

export default function BookingPage() {
  const router = useRouter()
  const [pickupDate, setPickupDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [pickupLocation, setPickupLocation] = useState("")
  const [returnLocation, setReturnLocation] = useState("")
  const [pickupTime, setPickupTime] = useState("10:00")
  const [returnTime, setReturnTime] = useState("10:00")
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => (prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]))
  }

  const calculateDays = () => {
    if (!pickupDate || !returnDate) return 0
    const diff = returnDate.getTime() - pickupDate.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    const days = calculateDays()
    const carTotal = days * carDetails.price
    const addonsTotal = selectedAddons.reduce((sum, addonId) => {
      const addon = addons.find((a) => a.id === addonId)
      return sum + (addon ? addon.price * days : 0)
    }, 0)
    return carTotal + addonsTotal
  }

  const handleProceedToPayment = () => {
    if (!pickupDate || !returnDate || !pickupLocation || !returnLocation) {
      alert("Please fill in all required fields")
      return
    }
    router.push(`/payment/${carDetails.id}`)
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
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings">My Bookings</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href={`/cars/${carDetails.id}`}>
            <ChevronLeft className="size-4 mr-1" />
            Back to Car Details
          </Link>
        </Button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                1
              </div>
              <span className="text-sm font-medium">Booking Details</span>
            </div>
            <div className="h-px bg-border flex-1" />
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold">
                2
              </div>
              <span className="text-sm text-muted-foreground">Payment</span>
            </div>
            <div className="h-px bg-border flex-1" />
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold">
                3
              </div>
              <span className="text-sm text-muted-foreground">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pickup & Return Details */}
            <Card>
              <CardHeader>
                <CardTitle>Pickup & Return Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pickup Location */}
                <div className="space-y-2">
                  <Label htmlFor="pickup-location">
                    Pickup Location <span className="text-destructive">*</span>
                  </Label>
                  <Select value={pickupLocation} onValueChange={setPickupLocation}>
                    <SelectTrigger id="pickup-location" className="h-11">
                      <SelectValue placeholder="Select pickup location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pickup Date & Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Pickup Date <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal bg-transparent",
                            !pickupDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {pickupDate ? format(pickupDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={pickupDate} onSelect={setPickupDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickup-time">
                      Pickup Time <span className="text-destructive">*</span>
                    </Label>
                    <Select value={pickupTime} onValueChange={setPickupTime}>
                      <SelectTrigger id="pickup-time" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0")
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Return Location */}
                <div className="space-y-2">
                  <Label htmlFor="return-location">
                    Return Location <span className="text-destructive">*</span>
                  </Label>
                  <Select value={returnLocation} onValueChange={setReturnLocation}>
                    <SelectTrigger id="return-location" className="h-11">
                      <SelectValue placeholder="Select return location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Return Date & Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Return Date <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal bg-transparent",
                            !returnDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {returnDate ? format(returnDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="return-time">
                      Return Time <span className="text-destructive">*</span>
                    </Label>
                    <Select value={returnTime} onValueChange={setReturnTime}>
                      <SelectTrigger id="return-time" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0")
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Information */}
            <Card>
              <CardHeader>
                <CardTitle>Driver Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input id="first-name" placeholder="John" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input id="last-name" placeholder="Doe" className="h-11" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input id="email" type="email" placeholder="john@example.com" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">
                    Driver's License Number <span className="text-destructive">*</span>
                  </Label>
                  <Input id="license" placeholder="DL123456789" className="h-11" />
                </div>
              </CardContent>
            </Card>

            {/* Add-ons */}
            <Card>
              <CardHeader>
                <CardTitle>Enhance Your Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addons.map((addon) => (
                  <div
                    key={addon.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-accent/50",
                      selectedAddons.includes(addon.id) ? "border-accent bg-accent/5" : "border-border",
                    )}
                    onClick={() => toggleAddon(addon.id)}
                  >
                    <Checkbox
                      id={addon.id}
                      checked={selectedAddons.includes(addon.id)}
                      onCheckedChange={() => toggleAddon(addon.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor={addon.id} className="font-semibold cursor-pointer">
                          {addon.name}
                        </Label>
                        <span className="font-bold">${addon.price}/day</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{addon.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Car Info */}
                <div className="flex gap-4">
                  <div className="relative w-24 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img
                      src={carDetails.image || "/placeholder.svg"}
                      alt={carDetails.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{carDetails.name}</h3>
                    <p className="text-sm text-muted-foreground">{carDetails.category}</p>
                    <Badge variant="secondary" className="mt-2">
                      ${carDetails.price}/day
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Rental Period */}
                {pickupDate && returnDate && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium mb-1">Pickup</div>
                        <div className="text-muted-foreground">
                          {pickupLocation || "Not selected"}
                          <br />
                          {pickupDate ? format(pickupDate, "PPP") : ""} at {pickupTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium mb-1">Return</div>
                        <div className="text-muted-foreground">
                          {returnLocation || "Not selected"}
                          <br />
                          {returnDate ? format(returnDate, "PPP") : ""} at {returnTime}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Car rental ({calculateDays()} {calculateDays() === 1 ? "day" : "days"})
                    </span>
                    <span className="font-medium">${calculateDays() * carDetails.price}</span>
                  </div>
                  {selectedAddons.map((addonId) => {
                    const addon = addons.find((a) => a.id === addonId)
                    if (!addon) return null
                    return (
                      <div key={addonId} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{addon.name}</span>
                        <span className="font-medium">${addon.price * calculateDays()}</span>
                      </div>
                    )
                  })}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-accent">${calculateTotal()}</span>
                  </div>
                </div>

                <Separator />

                {/* Protection Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="size-4" />
                    <span>Basic insurance included</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Check className="size-4" />
                    <span>Free cancellation (24h notice)</span>
                  </div>
                </div>

                <Button className="w-full h-12 text-base" size="lg" onClick={handleProceedToPayment}>
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
