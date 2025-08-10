import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Cloud } from 'lucide-react'; // Added Cloud icon for a subtle background element

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        // A modern, sticky header with a light, clean background
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-[#F9F6FF] shadow-sm">
            <div className="container flex items-center justify-between h-16"> {/* Added justify-between for spacing */}
                <Link to="/" className="flex items-center mr-6 space-x-2">
                    <Building2 className="text-blue-600 h-7 w-7" /> {/* Slightly larger, colored icon */}
                    <span className="text-xl font-extrabold text-gray-900">RealEstateApp</span> {/* Bolder, darker brand text */}
                </Link>

                {/* Main navigation links */}
                <nav className="items-center justify-center flex-1 hidden space-x-8 text-sm font-medium md:flex"> {/* Centered nav links */}
                    <Link to="/" className="text-gray-700 transition-colors duration-200 hover:text-blue-600">Home</Link>
                    <Link to="/listings" className="text-gray-700 transition-colors duration-200 hover:text-blue-600">All Listings</Link>
                    <Link to="/prediction" className="text-gray-700 transition-colors duration-200 hover:text-blue-600">Prediction</Link>
                    <Link to="/about" className="text-gray-700 transition-colors duration-200 hover:text-blue-600">About</Link>
                </nav>

                <div className="flex items-center justify-end space-x-4">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative rounded-full h-9 w-9"> {/* Slightly larger avatar button */}
                                    <Avatar className="h-9 w-9">
                                        {/* Assuming user has an avatarUrl property. If not, it shows the fallback. */}
                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                        <AvatarFallback className="font-semibold text-blue-600 bg-blue-100">{user.name?.[0].toUpperCase()}</AvatarFallback> {/* Styled fallback */}
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer"> {/* Added cursor-pointer */}
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        // Login/Register button styled to match the "SIGN UP NOW" button from Home
                        <Button 
                            asChild 
                            size="sm"
                            className="relative px-6 py-2 text-base font-bold rounded-xl shadow-md border-2 border-black bg-[#FFD700] text-gray-900 hover:bg-[#FFEA00] transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 overflow-hidden"
                        >
                            <Link to="/auth">
                                Login / Register
                                {/* Subtle cloud-like background element for the button */}
                                <Cloud className="absolute w-8 h-8 text-gray-800 -bottom-2 -right-2 opacity-10 rotate-12" />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
