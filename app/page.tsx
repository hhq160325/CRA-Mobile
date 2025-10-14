import Link from "next/link"
import Image from "next/image"
import { Search, SlidersHorizontal, Heart, Fuel, Settings2, Users, ArrowUpDown } from "lucide-react"

export default function HomePage() {
  const popularCars = [
    {
      id: 1,
      name: "Koenigsegg",
      type: "Sport",
      image: "/car-app/app/assets/images/white_ferrari.png",
      fuel: "90L",
      transmission: "Manual",
      capacity: "2 People",
      price: 99,
      liked: true,
    },
    {
      id: 2,
      name: "Nissan GT-R",
      type: "Sport",
      image: "/car-app/app/assets/images/whitecar.png",
      fuel: "80L",
      transmission: "Manual",
      capacity: "2 People",
      price: 80,
      originalPrice: 100,
      liked: false,
    },
  ]

  const recommendedCars = [
    {
      id: 3,
      name: "All New Rush",
      type: "SUV",
      image: "/car-app/app/assets/images/whitecar.png",
      fuel: "70L",
      transmission: "Manual",
      capacity: "6 People",
      price: 72,
      originalPrice: 80,
      liked: false,
    },
    {
      id: 4,
      name: "CR-V",
      type: "SUV",
      image: "/car-app/app/assets/images/whitecar.png",
      fuel: "80L",
      transmission: "Manual",
      capacity: "6 People",
      price: 80,
      liked: true,
    },
    {
      id: 5,
      name: "All New Terios",
      type: "SUV",
      image: "/car-app/app/assets/images/whitecar.png",
      fuel: "90L",
      transmission: "Manual",
      capacity: "6 People",
      price: 74,
      liked: false,
    },
    {
      id: 6,
      name: "MG ZX Excite",
      type: "Hatchback",
      image: "/car-app/app/assets/images/whitecar.png",
      fuel: "90L",
      transmission: "Manual",
      capacity: "4 People",
      price: 74,
      liked: false,
    },
  ]

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
          <Link
            href="/catalog"
            className="flex items-center justify-center w-12 h-12 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="bg-primary text-primary-foreground rounded-xl p-6 mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-md">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight">The Best Platform for Car Rental</h2>
            <p className="text-primary-foreground/90 text-sm mb-6">
              Ease of doing a car rental safely and reliably. Of course at a low price.
            </p>
            <Link
              href="/catalog"
              className="inline-block bg-[#54A6FF] hover:bg-[#4595EE] text-white px-6 py-3 rounded-md font-semibold text-sm transition-colors"
            >
              Rental Car
            </Link>
          </div>
          <div className="absolute right-0 bottom-0 w-64 h-32 md:w-96 md:h-48">
            <Image
              src="/car-app/app/assets/images/white_ferrari.png"
              alt="Sports car"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Pick-Up Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <span className="font-semibold text-base">Pick - Up</span>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-bold mb-2">Locations</label>
                <select className="w-full text-sm text-muted-foreground bg-transparent border-0 focus:outline-none">
                  <option>Select your city</option>
                  <option>Semarang</option>
                  <option>Jakarta</option>
                  <option>Bandung</option>
                </select>
              </div>
              <div className="border-l border-border pl-6">
                <label className="block text-base font-bold mb-2">Date</label>
                <select className="w-full text-sm text-muted-foreground bg-transparent border-0 focus:outline-none">
                  <option>Select your date</option>
                  <option>20 July 2022</option>
                  <option>21 July 2022</option>
                </select>
              </div>
              <div className="border-l border-border pl-6">
                <label className="block text-base font-bold mb-2">Time</label>
                <select className="w-full text-sm text-muted-foreground bg-transparent border-0 focus:outline-none">
                  <option>Select your time</option>
                  <option>07:00</option>
                  <option>08:00</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button className="w-14 h-14 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center transition-colors">
            <ArrowUpDown className="w-5 h-5" />
          </button>
        </div>

        {/* Drop-Off Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded-full bg-[#54A6FF]/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#54A6FF]" />
            </div>
            <span className="font-semibold text-base">Drop - Off</span>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-bold mb-2">Locations</label>
                <select className="w-full text-sm text-muted-foreground bg-transparent border-0 focus:outline-none">
                  <option>Select your city</option>
                  <option>Semarang</option>
                  <option>Jakarta</option>
                </select>
              </div>
              <div className="border-l border-border pl-6">
                <label className="block text-base font-bold mb-2">Date</label>
                <select className="w-full text-sm text-muted-foreground bg-transparent border-0 focus:outline-none">
                  <option>Select your date</option>
                  <option>21 July 2022</option>
                </select>
              </div>
              <div className="border-l border-border pl-6">
                <label className="block text-base font-bold mb-2">Time</label>
                <select className="w-full text-sm text-muted-foreground bg-transparent border-0 focus:outline-none">
                  <option>Select your time</option>
                  <option>01:00</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Car Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-muted-foreground text-base">Popular Car</h3>
            <Link href="/catalog" className="text-primary text-base font-semibold hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>

        {/* Recommendation Car Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-muted-foreground text-base">Recomendation Car</h3>
            <Link href="/catalog" className="text-primary text-base font-semibold hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>

        {/* Show More Button */}
        <div className="flex justify-center mt-8">
          <Link
            href="/catalog"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm transition-colors"
          >
            Show More Car
          </Link>
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

function CarCard({ car }: { car: any }) {
  return (
    <div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg">{car.name}</h4>
          <p className="text-sm text-muted-foreground">{car.type}</p>
        </div>
        <button className="p-1">
          <Heart className={`w-5 h-5 ${car.liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
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
          {car.originalPrice && (
            <div className="text-sm text-muted-foreground line-through">${car.originalPrice}.00</div>
          )}
        </div>
        <Link
          href={`/car/${car.id}`}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm transition-colors"
        >
          Rental Now
        </Link>
      </div>
    </div>
  )
}
