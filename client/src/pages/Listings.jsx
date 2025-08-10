// client/src/pages/Listings.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileWarning, Home, PlusCircle } from 'lucide-react'; // Added PlusCircle icon

// Shadcn UI Component Imports
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
// NEW: Import Dialog components
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreateListingForm from '../components/CreateListingForm';

// --- SkeletonCard and ListingCard components remain the same ---

const SkeletonCard = () => (
    <Card className="overflow-hidden">
        <Skeleton className="w-full h-48" />
        <CardHeader>
            <Skeleton className="w-3/4 h-6" />
            <Skeleton className="w-1/2 h-4" />
        </CardHeader>
        <CardContent>
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-3/4 h-4" />
        </CardContent>
        <CardFooter className="flex justify-between">
            <Skeleton className="w-1/4 h-8" />
            <Skeleton className="w-1/3 h-10" />
        </CardFooter>
    </Card>
);

const ListingCard = ({ listing }) => {
    return (
        <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-300 hover:shadow-lg">
            {listing.images && listing.images.length > 0 && (
                <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="object-cover w-full h-48"
                />
            )}
            <CardHeader>
                <CardTitle className="text-xl line-clamp-2">{listing.title}</CardTitle>
                <CardDescription className="text-lg font-semibold text-blue-600">
                    ₹{listing.price.toLocaleString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                    <p><span className="font-semibold text-foreground">Location:</span> {listing.location}</p>
                    <p>
                        <span className="font-semibold text-foreground">BHK:</span> {listing.bhk} | <span className="font-semibold text-foreground">Sqft:</span> {listing.sqft}
                    </p>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{listing.description}</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50">
                <div>
                     <Badge variant={listing.category === 'Sell' ? 'default' : 'secondary'}>
                        {listing.category}
                    </Badge>
                    <p className="mt-2 text-xs text-muted-foreground">
                        By {listing.user ? listing.user.name : 'N/A'} on {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <Button asChild>
                    <Link to={`/listings/${listing._id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
};


const Listings = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // NEW: State to control the visibility of the form dialog
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchListings = async () => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const { data } = await api.get('/listings');
            setListings(data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleListingCreated = () => {
        fetchListings(); // Refetch listings to show the new one
        setIsFormOpen(false); // Close the dialog after successful creation
    };

    return (
        <div className="container p-4 mx-auto sm:p-6 lg:p-8">
            <div className="flex flex-col items-start justify-between gap-4 mb-10 sm:flex-row sm:items-center">
                <div className="text-left">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
                        Property Listings
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Discover your next home or investment opportunity.
                    </p>
                </div>

                {/* MODIFIED: This section now holds the Dialog for the form */}
                {user && (
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="flex items-center w-full gap-2 sm:w-auto">
                                <PlusCircle className="w-5 h-5" />
                                <span>Create New Listing</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">Add a New Property</DialogTitle>
                                <DialogDescription>
                                    Fill in the details below to list your property. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <CreateListingForm onListingCreated={handleListingCreated} />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            
            {error && (
                <Alert variant="destructive" className="mb-8">
                    <FileWarning className="w-4 h-4" />
                    <AlertTitle>Error Fetching Data</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
                ) : (
                    listings.map((listing) => (
                        <ListingCard key={listing._id} listing={listing} />
                    ))
                )}
            </div>

            {!loading && listings.length === 0 && !error && (
                <div className="p-10 mt-10 text-center border-2 border-dashed rounded-lg col-span-full">
                    <h3 className="text-2xl font-semibold">No Listings Found</h3>
                    <p className="mt-2 text-muted-foreground">
                        It looks like there are no properties available right now.
                        {user ? ' Why not be the first to add one?' : ' Please check back later!'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Listings;