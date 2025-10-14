import Link from "next/link"
import Image from "next/image"
import { Search } from "lucide-react"

export default function AdminDashboard() {
  const recentTransactions = [
    {
      id: 1,
      car: "Nissan GT-R",
      type: "Sport Car",
      date: "20 July",
      price: 80,
      image: "/car-app/app/assets/images/whitecar.png",
    },
    {
      id: 2,
      car: "Koegnigsegg",
      type: "Sport Car",
      date: "19 July",
      price: 99,
      image: "/car-app/app/assets/images/white_ferrari.png",
    },
    {
      id: 3,
      car: "Rolls - Royce",
      type: "Sport Car",
      date: "18 July",
      price: 96,
      image: "/car-app/app/assets/images/whitecar.png",
    },
    {
      id: 4,
      car: "CR-V",
      type: "SUV",
      date: "17 July",
      price: 80,
      image: "/car-app/app/assets/images/whitecar.png",
    },
  ]

  const carTypes = [
    { name: "Sport Car", count: 17439, color: "#0D3559" },
    { name: "SUV", count: 9478, color: "#175D9C" },
    { name: "Coupe", count: 18197, color: "#2185DE" },
    { name: "Hatchback", count: 12510, color: "#63A9E8" },
    { name: "MPV", count: 14406, color: "#A6CEF2" },
  ]

  const totalRentals = 72030

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
        {/* Search Bar */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search something here"
              className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Detail Rental Card */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold mb-6">Detail Rental</h2>

              {/* Map Placeholder */}
              <div className="bg-primary/10 rounded-lg h-64 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <p className="text-muted-foreground">Map View</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rental Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="font-semibold text-base">Pick - Up</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xl font-bold">Kota Semarang</p>
                      <p className="text-sm text-muted-foreground">20 July 2022</p>
                      <p className="text-sm text-muted-foreground">07.00</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-[#54A6FF]" />
                    <span className="font-semibold text-base">Drop - Off</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xl font-bold">Kota Semarang</p>
                      <p className="text-sm text-muted-foreground">21 July 2022</p>
                      <p className="text-sm text-muted-foreground">01.00</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-24 bg-primary/10 rounded-lg">
                    <Image
                      src="/car-app/app/assets/images/whitecar.png"
                      alt="Nissan GT-R"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">Nissan GT - R</h3>
                    <p className="text-sm text-muted-foreground mb-2">Sport Car</p>
                    <p className="text-sm text-muted-foreground">#9761</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border mt-6 pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base text-muted-foreground mb-1">Total Rental Price</p>
                    <p className="text-xs text-muted-foreground">Overall price rental</p>
                  </div>
                  <p className="text-3xl font-bold">$80.00</p>
                </div>
              </div>
            </div>

            {/* Top 5 Car Rental */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold mb-6">Top 5 Car Rental</h2>

              <div className="flex items-center justify-center mb-8">
                {/* Donut Chart */}
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 200 200" className="transform -rotate-90">
                    {carTypes.map((type, index) => {
                      const total = carTypes.reduce((sum, t) => sum + t.count, 0)
                      const percentage = (type.count / total) * 100
                      const circumference = 2 * Math.PI * 70
                      const offset = carTypes
                        .slice(0, index)
                        .reduce((sum, t) => sum + (t.count / total) * circumference, 0)

                      return (
                        <circle
                          key={type.name}
                          cx="100"
                          cy="100"
                          r="70"
                          fill="none"
                          stroke={type.color}
                          strokeWidth="40"
                          strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
                          strokeDashoffset={-offset}
                        />
                      )
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold">{totalRentals.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Rental Car</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                {carTypes.map((type) => (
                  <div key={type.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                      <span className="text-sm font-semibold text-muted-foreground">{type.name}</span>
                    </div>
                    <span className="text-sm font-bold">{type.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Recent Transaction */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 border border-border sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Recent Transaction</h3>
                <Link href="#" className="text-primary text-xs font-semibold hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 pb-4 border-b border-border last:border-0"
                  >
                    <div className="relative w-28 h-16 bg-primary/10 rounded-lg flex-shrink-0">
                      <Image
                        src={transaction.image || "/placeholder.svg"}
                        alt={transaction.car}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base truncate">{transaction.car}</h4>
                      <p className="text-xs text-muted-foreground">{transaction.type}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground mb-1">{transaction.date}</p>
                      <p className="text-base font-bold">${transaction.price}.00</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
