"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, MapPin, MoreVertical, Download, Mail, X } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/lib/auth-context"
import { getBookingsByStatus } from "@/lib/mock-data/bookings"
import { ReviewDialog } from "@/components/review-dialog"

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const { user, isAuthenticated } = useAuth()

  const upcomingBookings = user ? getBookingsByStatus(user.id, "upcoming") : []
  const pastBookings = user ? getBookingsByStatus(user.id, "completed") : []
  const cancelledBookings = user ? getBookingsByStatus(user.id, "cancelled") : []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            Confirmed
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Booking ID</div>
            <div className="font-semibold">{booking.id}</div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(booking.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 size-4" />
                  Download Receipt
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 size-4" />
                  Email Details
                </DropdownMenuItem>
                {booking.status === "upcoming" && (
                  <>
                    <DropdownMenuItem className="text-destructive">
                      <X className="mr-2 size-4" />
                      Cancel Booking
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
            <img
              src={booking.carImage || "/placeholder.svg"}
              alt={booking.carName}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{booking.carName}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {booking.startDate.toLocaleDateString()} - {booking.endDate.toLocaleDateString()}
            </p>
            <div className="text-xl font-bold text-accent">${booking.totalPrice}</div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4 text-accent" />
              Pickup
            </div>
            <div className="pl-6 space-y-1">
              <div className="text-sm text-muted-foreground">{booking.pickupLocation}</div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-3.5 text-muted-foreground" />
                {booking.startDate.toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4 text-accent" />
              Return
            </div>
            <div className="pl-6 space-y-1">
              <div className="text-sm text-muted-foreground">{booking.dropoffLocation}</div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-3.5 text-muted-foreground" />
                {booking.endDate.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {booking.status === "upcoming" && (
          <>
            <Separator className="my-4" />
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                Modify Booking
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <Link href={`/cars/${booking.carId}`}>View Details</Link>
              </Button>
            </div>
          </>
        )}

        {booking.status === "completed" && (
          <>
            <Separator className="my-4" />
            <div className="flex gap-3">
              <ReviewDialog
                carName={booking.carName}
                carId={booking.carId}
                bookingId={booking.id}
                onSubmit={(rating, comment) => {
                  console.log("[v0] Review submitted:", { bookingId: booking.id, rating, comment })
                }}
              />
              <Button size="sm" className="flex-1" asChild>
                <Link href={`/cars/${booking.carId}`}>View Details</Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to view your bookings</p>
            <Button asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
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
              <Link href="/cars" className="text-sm font-medium hover:text-accent transition-colors">
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
          <h1 className="text-4xl font-bold mb-3">My Bookings</h1>
          <p className="text-muted-foreground text-lg">Manage your car rental reservations</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="upcoming" className="px-6">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="px-6">
              Past ({pastBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="px-6">
              Cancelled ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <Calendar className="size-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Upcoming Bookings</h3>
                    <p className="text-muted-foreground mb-6">
                      You don't have any upcoming reservations. Browse our collection to find your next ride.
                    </p>
                    <Button asChild>
                      <Link href="/cars">Browse Cars</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <Calendar className="size-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Past Bookings</h3>
                    <p className="text-muted-foreground">You haven't completed any rentals yet.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-6">
            {cancelledBookings.length > 0 ? (
              cancelledBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <Calendar className="size-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Cancelled Bookings</h3>
                    <p className="text-muted-foreground">You haven't cancelled any reservations.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
