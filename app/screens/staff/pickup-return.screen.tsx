"use client"

import { useState, useRef } from "react"
import { useParams, useRouter } from 'next/navigation'
import { Upload, Check, X, ChevronLeft, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Mock payment data
const mockPayments: Record<string, any> = {
    PAY001: {
        id: "PAY001",
        carName: "Koenigsegg",
        carType: "Sport",
        customerName: "John Doe",
        amount: 450,
        date: new Date("2024-01-15"),
        pickupTime: "10:00 AM",
        mileage: 15420,
        fuelLevel: "Full",
        returnTime: "04:00 PM",
    },
    PAY002: {
        id: "PAY002",
        carName: "Nissan GT-R",
        carType: "Sport",
        customerName: "Jane Smith",
        amount: 320,
        date: new Date("2024-01-16"),
        pickupTime: "02:00 PM",
        mileage: 12850,
        fuelLevel: "Full",
        returnTime: "06:00 PM",
    },
    PAY005: {
        id: "PAY005",
        carName: "All New Terios",
        carType: "SUV",
        customerName: "Emily Brown",
        amount: 360,
        date: new Date("2024-01-18"),
        pickupTime: "11:00 AM",
        mileage: 18500,
        fuelLevel: "Full",
        returnTime: "05:00 PM",
    },
}

type ConfirmationType = "pickup" | "return"

interface ImageData {
    file: File
    preview: string
}

export default function PickupReturnConfirmScreen() {
    const params = useParams()
    const router = useRouter()
    const paymentId = params.paymentId as string

    const [activeTab, setActiveTab] = useState<ConfirmationType>("pickup")
    const [pickupImage, setPickupImage] = useState<ImageData | null>(null)
    const [returnImage, setReturnImage] = useState<ImageData | null>(null)
    const [notes, setNotes] = useState("")
    const [loading, setLoading] = useState(false)

    const pickupInputRef = useRef<HTMLInputElement>(null)
    const returnInputRef = useRef<HTMLInputElement>(null)

    const payment = mockPayments[paymentId]

    if (!payment) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-8 text-center">
                        <p className="text-lg font-semibold text-primary mb-4">Payment not found</p>
                        <Button onClick={() => router.back()}>Go Back</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleImageUpload = (type: ConfirmationType, file: File) => {
        const acceptedFormats = ["image/png", "image/heic", "image/heif", "image/jpeg"]

        if (!acceptedFormats.includes(file.type)) {
            alert(`Invalid file format. Please upload PNG, HEIC, or JPEG. Got: ${file.type}`)
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("File size exceeds 10MB limit")
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const preview = e.target?.result as string
            const imageData = { file, preview }

            if (type === "pickup") {
                setPickupImage(imageData)
            } else {
                setReturnImage(imageData)
            }
        }
        reader.readAsDataURL(file)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: ConfirmationType) => {
        const file = e.target.files?.[0]
        if (file) {
            handleImageUpload(type, file)
        }
    }

    const handleRemoveImage = (type: ConfirmationType) => {
        if (type === "pickup") {
            setPickupImage(null)
            if (pickupInputRef.current) pickupInputRef.current.value = ""
        } else {
            setReturnImage(null)
            if (returnInputRef.current) returnInputRef.current.value = ""
        }
    }

    const handleSubmit = async () => {
        if (!pickupImage || !returnImage) {
            alert("Please upload both pickup and return confirmation images")
            return
        }

        setLoading(true)
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500))
            alert("Confirmation submitted successfully!")
            router.back()
        } catch (error) {
            alert("Failed to submit confirmation")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-primary font-semibold mb-2 hover:opacity-70"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-primary">Pickup & Return Confirmation</h1>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Vehicle Info Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <h2 className="text-xl font-bold text-primary">Vehicle Information</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold mb-2">CAR</p>
                                <p className="font-semibold text-primary">
                                    {payment.carName} ({payment.carType})
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold mb-2">CUSTOMER</p>
                                <p className="font-semibold text-primary">{payment.customerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold mb-2">AMOUNT</p>
                                <p className="font-bold text-primary">${payment.amount.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold mb-2">INITIAL MILEAGE</p>
                                <p className="font-semibold text-primary">{payment.mileage} km</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <div className="flex gap-8">
                        {(["pickup", "return"] as ConfirmationType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-3 px-4 font-semibold text-sm transition-all relative ${activeTab === tab
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-primary"
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-6">
                    {activeTab === "pickup" ? (
                        <>
                            {/* Pickup Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground font-semibold mb-2">PICKUP TIME</p>
                                        <p className="text-lg font-semibold text-primary">{payment.pickupTime}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground font-semibold mb-2">FUEL LEVEL</p>
                                        <p className="text-lg font-semibold text-primary">{payment.fuelLevel}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-bold text-primary">Pickup Confirmation Photo</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Accepted formats: PNG, HEIC, HEIF, JPEG (max 10MB)
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {pickupImage ? (
                                        <div className="relative border-2 border-emerald-500 rounded-lg overflow-hidden">
                                            <img
                                                src={pickupImage.preview || "/placeholder.svg"}
                                                alt="Pickup confirmation"
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                                                <div className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold">
                                                    <Check className="w-4 h-4" />
                                                    Image Uploaded
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveImage("pickup")}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => pickupInputRef.current?.click()}
                                            className="w-full border-2 border-dashed border-primary rounded-lg p-8 hover:bg-primary/5 transition-colors text-center"
                                        >
                                            <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                                            <p className="font-semibold text-primary mb-1">Click to upload photo</p>
                                            <p className="text-sm text-muted-foreground">PNG, HEIC, HEIF, JPEG up to 10MB</p>
                                        </button>
                                    )}
                                    <input
                                        ref={pickupInputRef}
                                        type="file"
                                        accept="image/png,image/heic,image/heif,image/jpeg"
                                        onChange={(e) => handleImageChange(e, "pickup")}
                                        className="hidden"
                                    />
                                    {pickupImage && (
                                        <Button
                                            onClick={() => pickupInputRef.current?.click()}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            Change Photo
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            {/* Return Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground font-semibold mb-2">RETURN TIME</p>
                                        <p className="text-lg font-semibold text-primary">{payment.returnTime}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground font-semibold mb-2">FINAL MILEAGE</p>
                                        <p className="text-lg font-semibold text-primary">
                                            {payment.mileage + 100} km (+100 km driven)
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-bold text-primary">Return Confirmation Photo</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Accepted formats: PNG, HEIC, HEIF, JPEG (max 10MB)
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {returnImage ? (
                                        <div className="relative border-2 border-emerald-500 rounded-lg overflow-hidden">
                                            <img
                                                src={returnImage.preview || "/placeholder.svg"}
                                                alt="Return confirmation"
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                                                <div className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold">
                                                    <Check className="w-4 h-4" />
                                                    Image Uploaded
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveImage("return")}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => returnInputRef.current?.click()}
                                            className="w-full border-2 border-dashed border-primary rounded-lg p-8 hover:bg-primary/5 transition-colors text-center"
                                        >
                                            <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                                            <p className="font-semibold text-primary mb-1">Click to upload photo</p>
                                            <p className="text-sm text-muted-foreground">PNG, HEIC, HEIF, JPEG up to 10MB</p>
                                        </button>
                                    )}
                                    <input
                                        ref={returnInputRef}
                                        type="file"
                                        accept="image/png,image/heic,image/heif,image/jpeg"
                                        onChange={(e) => handleImageChange(e, "return")}
                                        className="hidden"
                                    />
                                    {returnImage && (
                                        <Button
                                            onClick={() => returnInputRef.current?.click()}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            Change Photo
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex gap-4 sticky bottom-0 bg-white border-t border-gray-200 p-6 -mx-6">
                    <Button variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !pickupImage || !returnImage}
                        className="flex-1"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Confirmation"
                        )}
                    </Button>
                </div>
            </main>
        </div>
    )
}
