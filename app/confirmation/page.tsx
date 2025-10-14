import Link from "next/link"
import Image from "next/image"
import { CheckCircle, Star, Calendar, MapPin } from "lucide-react"

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 md:px-16">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="text-2xl md:text-3xl font-bold text-primary">
            MORENT
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
              <Image src="/assets/admin-avatar.png" alt="Profile" fill className="object-cover" />
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-12 md:px-16 max-w-4xl mx-auto">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Booking Confirmed!</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thank you for your rental. Your booking has been confirmed and we've sent the details to your email.
          </p>
        </div>

        {/* Booking Details */}
        <div className="bg-card rounded-lg p-8 border border-border mb-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
              <p className="text-2xl font-bold">#BK-2025-9761</p>
            </div>
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-md font-semibold">Confirmed</div>
          </div>

          {/* Car Info */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <div className="relative w-48 h-32 bg-primary/10 rounded-lg flex-shrink-0">
              <Image
                src="/car-app/app/assets/images/whitecar.png"
                alt="Nissan GT-R"
                fill
                className="object-contain p-4"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Nissan GT-R</h2>
              <p className="text-muted-foreground mb-3">Sport Car</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <Star className="w-4 h-4 fill-yellow-400/30 text-yellow-400/30" />
                </div>
                <span className="text-sm text-muted-foreground">440+ Reviewer</span>
              </div>
            </div>
          </div>

          {/* Rental Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="font-semibold text-base">Pick - Up</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="font-semibold">Kota Semarang</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-semibold">20 July 2022, 07:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#54A6FF]" />
                <span className="font-semibold text-base">Drop - Off</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="font-semibold">Kota Semarang</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-semibold">21 July 2022, 01:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base text-muted-foreground mb-1">Total Rental Price</p>
              <p className="text-sm text-muted-foreground">Overall price rental</p>
            </div>
            <p className="text-4xl font-bold">$80.00</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-center px-6 py-4 rounded-lg font-semibold transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/admin"
            className="bg-card hover:bg-muted text-foreground text-center px-6 py-4 rounded-lg font-semibold border border-border transition-colors"
          >
            View Dashboard
          </Link>
        </div>

        {/* Next Steps */}
        <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
          <h3 className="font-bold text-lg mb-4">What's Next?</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                1
              </div>
              <p>Check your email for the detailed confirmation and pickup instructions.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                2
              </div>
              <p>Bring your driver's license and booking confirmation to the pickup location.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                3
              </div>
              <p>Arrive 15 minutes early to complete the paperwork and vehicle inspection.</p>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16 px-6 py-12 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="text-2xl font-bold text-primary mb-4 block">
                MORENT
              </Link>
              <p className="text-muted-foreground text-sm">
                Our vision is to provide convenience and help increase your sales business.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">About</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Featured
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Partnership
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Bussiness Relation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Community</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Podcast
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Invite a friend
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Socials</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Facebook
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-semibold">©2022 MORENT. All rights reserved</p>
            <div className="flex gap-8 text-sm font-semibold">
              <Link href="#" className="hover:text-primary">
                Privacy & Policy
              </Link>
              <Link href="#" className="hover:text-primary">
                Terms & Condition
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
