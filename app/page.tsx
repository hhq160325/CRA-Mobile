import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Calendar, Star, Zap, Shield, Clock } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { mockCars } from "@/lib/mock-data/cars"

export default function HomePage() {
  const featuredCars = mockCars.slice(0, 3)

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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('/luxury-car-silhouette.jpg')] opacity-10 bg-cover bg-center" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance leading-tight">
              Premium Car Rentals Made Simple
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 text-pretty leading-relaxed">
              Experience luxury and convenience with our curated selection of premium vehicles. Book in minutes, drive
              in style.
            </p>
          </div>

          {/* Search Card */}
          <Card className="max-w-4xl shadow-2xl">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="size-4" />
                    Pickup Location
                  </label>
                  <Input placeholder="City or Airport" className="h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="size-4" />
                    Pickup Date
                  </label>
                  <Input type="date" className="h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="size-4" />
                    Return Date
                  </label>
                  <Input type="date" className="h-11" />
                </div>
              </div>
              <Button className="w-full mt-6 h-12 text-base" size="lg" asChild>
                <Link href="/cars">
                  <Search className="mr-2 size-5" />
                  Search Available Cars
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Zap className="size-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Instant Booking</h3>
              <p className="text-muted-foreground text-pretty">
                Book your perfect car in under 2 minutes with our streamlined process
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Shield className="size-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Fully Insured</h3>
              <p className="text-muted-foreground text-pretty">
                All rentals include comprehensive insurance coverage for peace of mind
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock className="size-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">24/7 Support</h3>
              <p className="text-muted-foreground text-pretty">
                Our dedicated team is always available to assist you on your journey
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-3">Featured Vehicles</h2>
              <p className="text-muted-foreground text-lg">Handpicked premium cars for your next adventure</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/cars">View All</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <Link href={`/cars/${car.id}`} key={car.id}>
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={car.image || "/placeholder.svg"}
                      alt={car.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 right-4 bg-card text-card-foreground border">
                      <Star className="size-3 fill-accent text-accent mr-1" />
                      {car.rating}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{car.name}</h3>
                        <p className="text-sm text-muted-foreground">{car.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${car.price}</div>
                        <div className="text-xs text-muted-foreground">per day</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {car.features.slice(0, 3).map((feature, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Browse by Category</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Luxury Sedans", count: 24, image: "/luxury-sedan.png" },
              { name: "SUVs", count: 18, image: "/luxury-suv.png" },
              { name: "Sports Cars", count: 12, image: "/sleek-red-sports-car.png" },
              { name: "Electric", count: 15, image: "/modern-electric-car.png" },
            ].map((category, index) => (
              <Link href={`/cars?category=${category.name}`} key={index}>
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                      <p className="text-sm text-white/90">{category.count} vehicles</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Ready to Hit the Road?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto text-pretty">
            Join thousands of satisfied customers who trust us for their car rental needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="h-12 px-8 text-base" asChild>
              <Link href="/cars">Browse All Cars</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">DriveNow</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Premium car rentals for the modern traveler. Experience luxury, convenience, and reliability.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="hover:text-foreground transition-colors">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/insurance" className="hover:text-foreground transition-colors">
                    Insurance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>2025 DriveNow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
