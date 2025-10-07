"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  Users,
  Fuel,
  Gauge,
  MapPin,
  Shield,
  Zap,
  Heart,
  Share2,
  ChevronLeft,
  Check,
  Calendar,
} from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { carsService, reviewsService } from "@/lib/api"
import type { Car } from "@/lib/mock-data/cars"
import type { Review } from "@/lib/mock-data/reviews"

export default function CarDetailsPage({ params }: { params: { id: string } }) {
  const [carDetails, setCarDetails] = useState<Car | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const [carResult, reviewsResult] = await Promise.all([
        carsService.getCarById(params.id),
        reviewsService.getCarReviews(params.id),
      ])

      if (carResult.data) {
        setCarDetails(carResult.data)
      }

      if (reviewsResult.data) {
        setReviews(reviewsResult.data)
      }

      setLoading(false)
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="size-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading car details...</p>
        </div>
      </div>
    )
  }

  if (!carDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Car not found</h2>
          <p className="text-muted-foreground mb-4">The car you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/cars">Back to Cars</Link>
          </Button>
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
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/cars">
            <ChevronLeft className="size-4 mr-1" />
            Back to Cars
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <Card className="overflow-hidden">
              <div className="relative aspect-[16/10] bg-muted">
                <img
                  src={carDetails.images[selectedImage] || "/placeholder.svg"}
                  alt={carDetails.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-10 rounded-full"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`size-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button size="icon" variant="secondary" className="size-10 rounded-full">
                    <Share2 className="size-5" />
                  </Button>
                </div>
              </div>
              {/* Thumbnail Gallery */}
              <div className="p-4 flex gap-3 overflow-x-auto">
                {carDetails.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? "border-accent" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`View ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </Card>

            {/* Tabs - Overview, Specs, Reviews */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({carDetails.reviews})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">About this car</h3>
                      <p className="text-muted-foreground leading-relaxed">{carDetails.description}</p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Features & Amenities</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {carDetails.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="size-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                              <Check className="size-3 text-accent" />
                            </div>
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
                          <Users className="size-6 text-accent mb-2" />
                          <div className="text-2xl font-bold">{carDetails.specs.seats}</div>
                          <div className="text-xs text-muted-foreground">Seats</div>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
                          <Gauge className="size-6 text-accent mb-2" />
                          <div className="text-sm font-bold">{carDetails.specs.transmission}</div>
                          <div className="text-xs text-muted-foreground">Transmission</div>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
                          <Fuel className="size-6 text-accent mb-2" />
                          <div className="text-sm font-bold">{carDetails.specs.fuel}</div>
                          <div className="text-xs text-muted-foreground">Fuel Type</div>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
                          <Calendar className="size-6 text-accent mb-2" />
                          <div className="text-2xl font-bold">{carDetails.year}</div>
                          <div className="text-xs text-muted-foreground">Year</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specifications" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Make</span>
                        <span className="font-medium">{carDetails.brand}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Model</span>
                        <span className="font-medium">{carDetails.model}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Year</span>
                        <span className="font-medium">{carDetails.year}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Seats</span>
                        <span className="font-medium">{carDetails.specs.seats}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Transmission</span>
                        <span className="font-medium">{carDetails.specs.transmission}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Fuel Type</span>
                        <span className="font-medium">{carDetails.specs.fuel}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Engine</span>
                        <span className="font-medium">{carDetails.specs.engine}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Horsepower</span>
                        <span className="font-medium">{carDetails.specs.horsepower}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Mileage</span>
                        <span className="font-medium">{carDetails.specs.mileage}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{carDetails.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold mb-1">{carDetails.rating}</div>
                        <div className="flex items-center justify-center mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`size-4 ${i < Math.floor(carDetails.rating) ? "fill-accent text-accent" : "text-muted"}`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">{carDetails.reviews} reviews</div>
                      </div>
                      <Separator orientation="vertical" className="h-20" />
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm w-8">{stars}★</span>
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent"
                                style={{ width: `${stars === 5 ? 85 : stars === 4 ? 12 : 3}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {stars === 5 ? 85 : stars === 4 ? 12 : 3}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="space-y-3">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.userAvatar || "/placeholder.svg"} />
                              <AvatarFallback>{review.userName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold">{review.userName}</h4>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`size-3.5 ${i < review.rating ? "fill-accent text-accent" : "text-muted"}`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                          {review.id !== reviews[reviews.length - 1].id && <Separator />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">{carDetails.name}</h2>
                      <p className="text-muted-foreground">{carDetails.category}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      <Star className="size-3 fill-accent text-accent mr-1" />
                      {carDetails.rating}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">${carDetails.price}</span>
                  <span className="text-muted-foreground">/ day</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span>{carDetails.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="size-4 text-muted-foreground" />
                    <span>Fully insured</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Zap className="size-4 text-muted-foreground" />
                    <span>Instant confirmation</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button className="w-full h-12 text-base" size="lg" asChild>
                    <Link href={`/booking/${carDetails.id}`}>Book Now</Link>
                  </Button>
                  <Button variant="outline" className="w-full h-12 text-base bg-transparent" size="lg">
                    Contact Support
                  </Button>
                </div>

                <div className="pt-4 border-t text-center text-sm text-muted-foreground">
                  Free cancellation up to 24 hours before pickup
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
