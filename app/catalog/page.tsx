import Link from "next/link"
import Image from "next/image"
import { Search, SlidersHorizontal, Heart, Fuel, Settings2, Users } from "lucide-react"

export default function CatalogPage() {
  const allCars = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: i % 4 === 0 ? "Koenigsegg" : i % 4 === 1 ? "Nissan GT-R" : i % 4 === 2 ? "Rolls-Royce" : "CR-V",
    type: i % 2 === 0 ? "Sport" : "SUV",
    image: "/car-app/app/assets/images/whitecar.png",
    fuel: "80L",
    transmission: "Manual",
    capacity: i % 2 === 0 ? "2 People" : "6 People",
    price: 70 + i * 5,
    liked: i % 3 === 0,
  }))

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
          <button className="flex items-center justify-center w-12 h-12 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-xs font-semibold text-muted-foreground mb-6 uppercase tracking-wider">Type</h3>
              <div className="space-y-4 mb-8">
                {["Sport", "SUV", "MPV", "Sedan", "Coupe", "Hatchback"].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      defaultChecked={type === "Sport" || type === "SUV"}
                    />
                    <span className="text-lg font-semibold text-muted-foreground">{type}</span>
                    <span className="ml-auto text-lg font-semibold text-muted-foreground">
                      {type === "Sport" ? "10" : "12"}
                    </span>
                  </label>
                ))}
              </div>

              <h3 className="text-xs font-semibold text-muted-foreground mb-6 uppercase tracking-wider">Capacity</h3>
              <div className="space-y-4">
                {["2 Person", "4 Person", "6 Person", "8 or More"].map((capacity) => (
                  <label key={capacity} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      defaultChecked={capacity === "2 Person"}
                    />
                    <span className="text-lg font-semibold text-muted-foreground">{capacity}</span>
                    <span className="ml-auto text-lg font-semibold text-muted-foreground">10</span>
                  </label>
                ))}
              </div>

              <h3 className="text-xs font-semibold text-muted-foreground mb-6 mt-8 uppercase tracking-wider">Price</h3>
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="100"
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-lg font-semibold text-foreground mt-4">Max. $100.00</p>
              </div>
            </div>
          </aside>

          {/* Car Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {allCars.map((car) => (
                <div
                  key={car.id}
                  className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-lg">{car.name}</h4>
                      <p className="text-sm text-muted-foreground">{car.type}</p>
                    </div>
                    <button className="p-1">
                      <Heart
                        className={`w-5 h-5 ${car.liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                      />
                    </button>
                  </div>
                  <div className="my-8 flex justify-center">
                    <div className="relative w-full h-24">
                      <Image src={car.image || "/placeholder.svg"} alt={car.name} fill className="object-contain" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Fuel className="w-4 h-4" />
                      <span>{car.fuel}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings2 className="w-4 h-4" />
                      <span>{car.transmission}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{car.capacity}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold">${car.price}.00/</span>
                      <span className="text-sm text-muted-foreground">day</span>
                    </div>
                    <Link
                      href={`/car/${car.id}`}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm transition-colors"
                    >
                      Rental Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More */}
            <div className="flex justify-center">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm transition-colors">
                Show more car
              </button>
              <p className="ml-4 text-muted-foreground self-center">120 Car</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
