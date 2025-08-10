import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import our Auth context
import { useNavigate } from 'react-router-dom';

// Shadcn UI Imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react'; // For the alert icon

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null); // To display API errors
    const [loading, setLoading] = useState(false); // For form submission loading state

    const { login, register } = useAuth(); // Get login/register functions from context
    const navigate = useNavigate(); // For redirecting if already logged in

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                // navigate('/'); // Assuming successful login redirects to home
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }
                await register(name, email, password);
                // navigate('/'); // Assuming successful registration redirects to home
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 font-sans bg-gray-100">
            <Card className="w-full max-w-md rounded-lg shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center text-gray-800">
                        {isLogin ? 'Login' : 'Register'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <Terminal className="w-4 h-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="mb-4">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Your Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        )}
                        <div className="mb-4">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Your Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {!isLogin && (
                            <div className="mb-6">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="********"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
                            </Button>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <Button
                                    variant="link"
                                    type="button"
                                    className="h-auto p-0 ml-1 font-bold"
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError(null); // Clear errors on toggle
                                        setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); // Clear fields
                                    }}
                                >
                                    {isLogin ? 'Register' : 'Login'}
                                </Button>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Auth;
