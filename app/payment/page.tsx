"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Star, Check } from "lucide-react"

export default function PaymentPage() {
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("credit-card")

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

      <main className="px-6 py-8 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Billing Info */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Billing Info</h2>
                  <p className="text-sm text-muted-foreground">Please enter your billing info</p>
                </div>
                <span className="text-sm text-muted-foreground">Step 1 of 4</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold mb-3">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold mb-3">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold mb-3">Address</label>
                  <input
                    type="text"
                    placeholder="Address"
                    className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold mb-3">Town/City</label>
                  <input
                    type="text"
                    placeholder="Town or city"
                    className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Rental Info */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Rental Info</h2>
                  <p className="text-sm text-muted-foreground">Please select your rental date</p>
                </div>
                <span className="text-sm text-muted-foreground">Step 2 of 4</span>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span className="font-semibold">Pick - Up</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-bold mb-3">Locations</label>
                    <select className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Select your city</option>
                      <option>Semarang</option>
                      <option>Jakarta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-bold mb-3">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-bold mb-3">Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 rounded-full bg-[#54A6FF]/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#54A6FF]" />
                  </div>
                  <span className="font-semibold">Drop - Off</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-bold mb-3">Locations</label>
                    <select className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Select your city</option>
                      <option>Semarang</option>
                      <option>Jakarta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-bold mb-3">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-bold mb-3">Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Payment Method</h2>
                  <p className="text-sm text-muted-foreground">Please enter your payment method</p>
                </div>
                <span className="text-sm text-muted-foreground">Step 3 of 4</span>
              </div>

              <div className="space-y-4 mb-6">
                <label className="flex items-center justify-between p-4 bg-input rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="credit-card"
                      checked={paymentMethod === "credit-card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-primary"
                    />
                    <span className="font-semibold">Credit Card</span>
                  </div>
                  <Image src="/visa-application-process.png" alt="Visa" width={40} height={24} />
                </label>

                {paymentMethod === "credit-card" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <div className="md:col-span-2">
                      <label className="block text-base font-bold mb-3">Card Number</label>
                      <input
                        type="text"
                        placeholder="Card number"
                        className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-base font-bold mb-3">Card Holder</label>
                      <input
                        type="text"
                        placeholder="Card holder"
                        className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-bold mb-3">Expiration Date</label>
                      <input
                        type="text"
                        placeholder="DD/MM/YY"
                        className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-bold mb-3">CVC</label>
                      <input
                        type="text"
                        placeholder="CVC"
                        className="w-full px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-center justify-between p-4 bg-input rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-primary"
                    />
                    <span className="font-semibold">PayPal</span>
                  </div>
                  <Image src="/paypal-digital-payment.png" alt="PayPal" width={80} height={24} />
                </label>

                <label className="flex items-center justify-between p-4 bg-input rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="bitcoin"
                      checked={paymentMethod === "bitcoin"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-primary"
                    />
                    <span className="font-semibold">Bitcoin</span>
                  </div>
                  <Image src="/bitcoin-concept.png" alt="Bitcoin" width={24} height={24} />
                </label>
              </div>
            </div>

            {/* Confirmation */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Confirmation</h2>
                  <p className="text-sm text-muted-foreground">
                    We are getting to the end. Just few clicks and your rental is ready!
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">Step 4 of 4</span>
              </div>

              <div className="space-y-4 mb-6">
                <label className="flex items-start gap-3 p-4 bg-input rounded-lg cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 mt-0.5 rounded text-primary" />
                  <span className="text-sm text-muted-foreground">
                    I agree with sending an Marketing and newsletter emails. No spam, promissed!
                  </span>
                </label>

                <label className="flex items-start gap-3 p-4 bg-input rounded-lg cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 mt-0.5 rounded text-primary" />
                  <span className="text-sm text-muted-foreground">
                    I agree with our terms and conditions and privacy policy.
                  </span>
                </label>
              </div>

              <Link
                href="/confirmation"
                className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Rental Now
              </Link>

              <div className="mt-6 flex items-start gap-2">
                <Check className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">All your data are safe</p>
                  <p className="text-sm text-muted-foreground">
                    We are using the most advanced security to provide you the best experience ever.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 border border-border sticky top-8">
              <h3 className="text-xl font-bold mb-6">Rental Summary</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Prices may change depending on the length of the rental and the price of your rental car.
              </p>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-32 h-24 bg-primary rounded-lg">
                  <Image
                    src="/car-app/app/assets/images/whitecar.png"
                    alt="Nissan GT-R"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-1">Nissan GT-R</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                      <Star className="w-3 h-3 fill-yellow-400/30 text-yellow-400/30" />
                    </div>
                    <span className="text-xs text-muted-foreground">440+ Reviewer</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6 mb-6">
                <div className="flex justify-between mb-4">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">$80.00</span>
                </div>
                <div className="flex justify-between mb-6">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-bold">$0</span>
                </div>

                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    placeholder="Apply promo code"
                    className="flex-1 px-4 py-3 bg-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button className="px-6 py-3 font-semibold text-sm hover:bg-muted rounded-lg transition-colors">
                    Apply now
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xl font-bold">Total Rental Price</p>
                  <p className="text-xs text-muted-foreground">Overall price rental</p>
                </div>
                <p className="text-3xl font-bold">$80.00</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
