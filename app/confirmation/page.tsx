import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Download, Mail, Calendar, MapPin } from "lucide-react"

export default function ConfirmationPage() {
  const booking = {
    id: "BK-2025-001234",
    car: {
      name: "Tesla Model S",
      category: "Electric Luxury",
      image: "/tesla-model-s-luxury.png",
    },
    pickup: {
      location: "Los Angeles International Airport (LAX)",
      date: "January 15, 2025",
      time: "10:00 AM",
    },
    return: {
      location: "Los Angeles International Airport (LAX)",
      date: "January 18, 2025",
      time: "10:00 AM",
    },
    total: 478.5,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
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

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
              <CheckCircle2 className="size-10 text-green-600 dark:text-green-500" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Booking Confirmed!</h1>
            <p className="text-lg text-muted-foreground">
              Your reservation has been successfully processed. We've sent a confirmation email with all the details.
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="mb-6">
            <CardContent className="p-8 space-y-6">
              {/* Booking ID */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Booking Reference</div>
                  <div className="text-2xl font-bold">{booking.id}</div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                >
                  Confirmed
                </Badge>
              </div>

              <Separator />

              {/* Car Details */}
              <div className="flex gap-4">
                <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img
                    src={booking.car.image || "/placeholder.svg"}
                    alt={booking.car.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{booking.car.name}</h3>
                  <p className="text-muted-foreground">{booking.car.category}</p>
                </div>
              </div>

              <Separator />

              {/* Pickup & Return Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="size-4 text-accent" />
                    Pickup Details
                  </div>
                  <div className="pl-6 space-y-1">
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">{booking.pickup.location}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span className="text-sm">
                        {booking.pickup.date} at {booking.pickup.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="size-4 text-accent" />
                    Return Details
                  </div>
                  <div className="pl-6 space-y-1">
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">{booking.return.location}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span className="text-sm">
                        {booking.return.date} at {booking.return.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total Paid</span>
                <span className="text-2xl font-bold text-accent">${booking.total}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Button variant="outline" size="lg" className="h-12 bg-transparent">
              <Download className="mr-2 size-5" />
              Download Receipt
            </Button>
            <Button variant="outline" size="lg" className="h-12 bg-transparent">
              <Mail className="mr-2 size-5" />
              Email Confirmation
            </Button>
          </div>

          {/* Next Steps */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="size-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 font-semibold text-accent">
                    1
                  </div>
                  <div>
                    <div className="font-medium mb-1">Check your email</div>
                    <div className="text-sm text-muted-foreground">
                      We've sent a detailed confirmation with pickup instructions and contact information.
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 font-semibold text-accent">
                    2
                  </div>
                  <div>
                    <div className="font-medium mb-1">Prepare your documents</div>
                    <div className="text-sm text-muted-foreground">
                      Bring your driver's license, credit card, and booking confirmation to the pickup location.
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 font-semibold text-accent">
                    3
                  </div>
                  <div>
                    <div className="font-medium mb-1">Pick up your car</div>
                    <div className="text-sm text-muted-foreground">
                      Arrive at the pickup location at your scheduled time. Our team will have your car ready.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button size="lg" className="flex-1 h-12" asChild>
              <Link href="/bookings">View My Bookings</Link>
            </Button>
            <Button variant="outline" size="lg" className="flex-1 h-12 bg-transparent" asChild>
              <Link href="/cars">Browse More Cars</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
