import Link from "next/link"
import Image from "next/image"
import { Search, Heart, Star } from "lucide-react"

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const reviews = [
    {
      id: 1,
      name: "Alex Stanton",
      role: "CEO at Bukalapak",
      date: "21 July 2022",
      rating: 4,
      comment:
        "We are very happy with the service from the MORENT App. Morent has a low price and also a large variety of cars with good and comfortable facilities. In addition, the service provided by the officers is also very friendly and very polite.",
      avatar: "/assets/male-avatar.png",
    },
    {
      id: 2,
      name: "Skylar Dias",
      role: "CEO at Amazon",
      date: "20 July 2022",
      rating: 4,
      comment:
        "We are greatly helped by the services of the MORENT Application. Morent has low prices and also a wide variety of cars with good and comfortable facilities. In addition, the service provided by the officers is also very friendly and very polite.",
      avatar: "/assets/diverse-female-avatar.png",
    },
  ]

  const recentCars = [
    {
      id: 1,
      name: "Koenigsegg",
      type: "Sport",
      image: "/car-app/app/assets/images/white_ferrari.png",
      fuel: "90L",
      transmission: "Manual",
      capacity: "2 People",
      price: 99,
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="bg-primary rounded-lg p-8 mb-6 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-semibold text-primary-foreground mb-2">
                  Sports car with the best design and acceleration
                </h2>
                <p className="text-primary-foreground/90 text-sm mb-6">
                  Safety and comfort while driving a futuristic and elegant sports car
                </p>
              </div>
              <div className="relative w-full h-48">
                <Image
                  src="/car-app/app/assets/images/whitecar.png"
                  alt="Nissan GT-R"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-primary rounded-lg p-4 relative h-32">
                  <Image
                    src="/car-app/app/assets/images/whitecar.png"
                    alt={`View ${i}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>

            {/* Car Details */}
            <div className="bg-card rounded-lg p-6 border border-border mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Nissan GT-R</h1>
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
                <button>
                  <Heart className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              <p className="text-muted-foreground text-base leading-relaxed mb-8">
                NISMO has become the embodiment of Nissan's outstanding performance, inspired by the most unforgiving
                proving ground, the "race track".
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type Car</span>
                  <span className="font-semibold">Sport</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-semibold">2 Person</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Steering</span>
                  <span className="font-semibold">Manual</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gasoline</span>
                  <span className="font-semibold">70 L</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold">$80.00/</span>
                  <span className="text-muted-foreground">days</span>
                  <div className="text-muted-foreground line-through">$100.00</div>
                </div>
                <Link
                  href="/payment"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-md font-semibold transition-colors"
                >
                  Rent Now
                </Link>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Reviews</h3>
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-semibold">
                  13
                </span>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-border last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={review.avatar || "/placeholder.svg"}
                          alt={review.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-lg">{review.name}</h4>
                            <p className="text-sm text-muted-foreground">{review.role}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">{review.date}</p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4].map((i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                              <Star className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 text-center text-muted-foreground hover:text-foreground font-semibold">
                Show All
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 border border-border sticky top-8">
              <h3 className="text-base font-semibold mb-5">Recent Car</h3>
              <div className="space-y-4">
                {recentCars.map((car) => (
                  <Link
                    key={car.id}
                    href={`/car/${car.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="relative w-24 h-16 flex-shrink-0">
                      <Image src={car.image || "/placeholder.svg"} alt={car.name} fill className="object-contain" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base">{car.name}</h4>
                      <p className="text-xs text-muted-foreground">{car.type}</p>
                      <p className="text-base font-bold mt-1">${car.price}.00</p>
                    </div>
                  </Link>
                ))}
              </div>

              <h3 className="text-base font-semibold mb-5 mt-8">Recomendation Car</h3>
              <div className="space-y-4">
                {recentCars.map((car) => (
                  <Link
                    key={car.id}
                    href={`/car/${car.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="relative w-24 h-16 flex-shrink-0">
                      <Image src={car.image || "/placeholder.svg"} alt={car.name} fill className="object-contain" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base">{car.name}</h4>
                      <p className="text-xs text-muted-foreground">{car.type}</p>
                      <p className="text-base font-bold mt-1">
                        ${car.price}.00
                        {car.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through ml-2">
                            ${car.originalPrice}.00
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
