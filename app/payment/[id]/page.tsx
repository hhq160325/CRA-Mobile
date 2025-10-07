"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, CreditCard, Lock, Check } from "lucide-react"

const bookingSummary = {
  car: {
    name: "Tesla Model S",
    category: "Electric Luxury",
    image: "/tesla-model-s-luxury.png",
  },
  rental: {
    days: 3,
    pricePerDay: 120,
    pickup: "Los Angeles International Airport (LAX)",
    return: "Los Angeles International Airport (LAX)",
    pickupDate: "Jan 15, 2025",
    returnDate: "Jan 18, 2025",
  },
  addons: [
    { name: "Premium Insurance", price: 75 },
    { name: "GPS Navigation", price: 30 },
  ],
  subtotal: 435,
  tax: 43.5,
  total: 478.5,
}

export default function PaymentPage() {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    if (!agreeToTerms) {
      alert("Please agree to the terms and conditions")
      return
    }

    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    router.push("/confirmation")
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
          <Link href={`/booking/1`}>
            <ChevronLeft className="size-4 mr-1" />
            Back to Booking
          </Link>
        </Button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <Check className="size-4" />
              </div>
              <span className="text-sm font-medium">Booking Details</span>
            </div>
            <div className="h-px bg-accent flex-1" />
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                2
              </div>
              <span className="text-sm font-medium">Payment</span>
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
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === "card" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="size-5" />
                      <div>
                        <div className="font-semibold">Credit / Debit Card</div>
                        <div className="text-sm text-muted-foreground">Visa, Mastercard, Amex</div>
                      </div>
                    </Label>
                  </div>
                  <div
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === "paypal" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                    }`}
                    onClick={() => setPaymentMethod("paypal")}
                  >
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="size-5 rounded bg-[#0070ba] flex items-center justify-center text-white text-xs font-bold">
                        P
                      </div>
                      <div>
                        <div className="font-semibold">PayPal</div>
                        <div className="text-sm text-muted-foreground">Fast and secure</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Card Details */}
            {paymentMethod === "card" && (
              <Card>
                <CardHeader>
                  <CardTitle>Card Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">
                      Card Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input id="card-number" placeholder="1234 5678 9012 3456" className="h-11 pr-12" maxLength={19} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <div className="size-6 rounded bg-gradient-to-br from-blue-600 to-blue-400" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-name">
                      Cardholder Name <span className="text-destructive">*</span>
                    </Label>
                    <Input id="card-name" placeholder="John Doe" className="h-11" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">
                        Expiry Date <span className="text-destructive">*</span>
                      </Label>
                      <Input id="expiry" placeholder="MM/YY" className="h-11" maxLength={5} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">
                        CVV <span className="text-destructive">*</span>
                      </Label>
                      <Input id="cvv" placeholder="123" className="h-11" maxLength={4} type="password" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Street Address <span className="text-destructive">*</span>
                  </Label>
                  <Input id="address" placeholder="123 Main Street" className="h-11" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input id="city" placeholder="Los Angeles" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">
                      State <span className="text-destructive">*</span>
                    </Label>
                    <Input id="state" placeholder="CA" className="h-11" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">
                      ZIP Code <span className="text-destructive">*</span>
                    </Label>
                    <Input id="zip" placeholder="90001" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Country <span className="text-destructive">*</span>
                    </Label>
                    <Input id="country" placeholder="United States" className="h-11" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link href="/terms" className="text-accent hover:underline">
                      Terms and Conditions
                    </Link>
                    ,{" "}
                    <Link href="/privacy" className="text-accent hover:underline">
                      Privacy Policy
                    </Link>
                    , and{" "}
                    <Link href="/rental-agreement" className="text-accent hover:underline">
                      Rental Agreement
                    </Link>
                    . I understand that I must be at least 21 years old with a valid driver's license to rent a vehicle.
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Car Info */}
                <div className="flex gap-4">
                  <div className="relative w-24 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img
                      src={bookingSummary.car.image || "/placeholder.svg"}
                      alt={bookingSummary.car.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{bookingSummary.car.name}</h3>
                    <p className="text-sm text-muted-foreground">{bookingSummary.car.category}</p>
                  </div>
                </div>

                <Separator />

                {/* Rental Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup</span>
                    <span className="font-medium text-right">{bookingSummary.rental.pickupDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return</span>
                    <span className="font-medium text-right">{bookingSummary.rental.returnDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{bookingSummary.rental.days} days</span>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Car rental ({bookingSummary.rental.days} days)</span>
                    <span className="font-medium">
                      ${bookingSummary.rental.days * bookingSummary.rental.pricePerDay}
                    </span>
                  </div>
                  {bookingSummary.addons.map((addon, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{addon.name}</span>
                      <span className="font-medium">${addon.price}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax & Fees</span>
                    <span className="font-medium">${bookingSummary.tax}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-accent">${bookingSummary.total}</span>
                  </div>
                </div>

                <Separator />

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Lock className="size-4" />
                  <span>Secure payment with 256-bit SSL encryption</span>
                </div>

                <Button
                  className="w-full h-12 text-base"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing || !agreeToTerms}
                >
                  {isProcessing ? "Processing..." : `Pay $${bookingSummary.total}`}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You won't be charged until your booking is confirmed
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
