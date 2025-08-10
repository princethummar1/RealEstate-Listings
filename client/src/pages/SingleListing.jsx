// client/src/pages/SingleListing.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

// Import shadcn/ui components and icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, MapPin, BedDouble, Home as HomeIcon, UserCircle, CalendarDays } from 'lucide-react';

const SingleListing = () => {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Core logic is completely unchanged ---
    useEffect(() => {
        const fetchListing = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await api.get(`/listings/${id}`);
                setListing(data);
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message;
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchListing();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="container mx-auto max-w-5xl p-4 md:p-8">
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-8 text-destructive text-xl">Error: {error}</div>;
    }

    if (!listing) {
        return <div className="text-center p-8 text-muted-foreground text-xl">Listing not found.</div>;
    }

    return (
        <div className="container mx-auto max-w-5xl p-4 md:p-8">
            <Button asChild variant="ghost" className="mb-6">
                <Link to="/listings"><ChevronLeft className="mr-2 h-4 w-4" />Back to all listings</Link>
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Image Carousel */}
                <div className="w-full">
                    <Carousel className="rounded-lg overflow-hidden">
                        <CarouselContent>
                            {listing.images && listing.images.length > 0 ? (
                                listing.images.map((image, index) => (
                                    <CarouselItem key={index}>
                                        <div className="aspect-square bg-muted">
                                            <img src={image.url} alt={`${listing.title} - ${index + 1}`} className="h-full w-full object-cover" />
                                        </div>
                                    </CarouselItem>
                                ))
                            ) : (
                                <CarouselItem>
                                    <div className="aspect-square bg-muted flex items-center justify-center">
                                        <HomeIcon className="h-24 w-24 text-muted-foreground" />
                                    </div>
                                </CarouselItem>
                            )}
                        </CarouselContent>
                        <CarouselPrevious className="left-4" />
                        <CarouselNext className="right-4" />
                    </Carousel>
                </div>

                {/* Details Section */}
                <div className="flex flex-col">
                    <Badge variant={listing.category === 'Sell' ? 'default' : 'secondary'} className="w-fit mb-2">
                        For {listing.category}
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">{listing.title}</h1>
                    <p className="text-3xl text-primary font-semibold mb-6">₹{listing.price.toLocaleString()}</p>

                    <Card>
                        <CardHeader>
                            <CardTitle>Property Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <div className="flex items-center"><MapPin className="mr-3 h-5 w-5 text-primary" /> {listing.location}</div>
                            <div className="flex items-center"><BedDouble className="mr-3 h-5 w-5 text-primary" /> {listing.bhk} BHK</div>
                            <div className="flex items-center"><HomeIcon className="mr-3 h-5 w-5 text-primary" /> {listing.sqft} sqft</div>
                        </CardContent>
                    </Card>

                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground prose dark:prose-invert">{listing.description}</p>
                    </div>

                    <div className="mt-auto pt-8 text-sm text-muted-foreground space-y-2">
                         <div className="flex items-center"><UserCircle className="mr-2 h-4 w-4" />Listed by: <span className="font-semibold text-foreground ml-1">{listing.user?.name || 'N/A'}</span></div>
                         <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4" />Posted on: {new Date(listing.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleListing;