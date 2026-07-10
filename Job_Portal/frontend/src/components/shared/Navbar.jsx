import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { LogOut, User2, MessageCircle, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';
import NotificationBell from '../NotificationBell';
import NotificationCenter from '../NotificationCenter';
import SocketIndicator from '../SocketIndicator';

// ✅ Updated API constant
const USER_API_END_POINT = 'http://localhost:8000/api/users';

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { 
                withCredentials: true 
            });
            
            if (res.data.success) {
                dispatch(setUser(null));
                // Clear localStorage items
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate("/");
                toast.success(res.data.message || '✅ Logged out successfully');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || '❌ Logout failed');
        }
        setMobileMenuOpen(false); // Close mobile menu after logout
    };

    const handleLinkClick = () => {
        setMobileMenuOpen(false); // Close mobile menu when navigating
    };

    return (
        <div className='bg-white shadow-sm border-b'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4 lg:px-8'>
                <Link to="/" className='cursor-pointer flex items-center'>
                    <h1 className='text-2xl font-bold text-[#6A38C2]'>Job<span className='text-[#F83002]'>Portal</span></h1>
                </Link>

                {/* Desktop Navigation */}
                <div className='hidden md:flex items-center gap-12'>
                    {user && user.role === 'recruiter' ? (
                        <>
                            <ul className='flex font-medium items-center gap-5'>
                                <li><Link to="/admin/companies" className='hover:text-[#6A38C2] transition-colors'>Companies</Link></li>
                                <li><Link to="/admin/jobs" className='hover:text-[#6A38C2] transition-colors'>Jobs</Link></li>
                                <li><Link to="/recruiter/interviews" className='hover:text-[#6A38C2] transition-colors'>Interviews</Link></li>
                            </ul>
                        </>
                    ) : (
                        <>
                            <ul className='flex font-medium items-center gap-5'>
                                <li><Link to="/" className='hover:text-[#6A38C2] transition-colors'>Home</Link></li>
                                <li><Link to="/jobs" className='hover:text-[#6A38C2] transition-colors'>Jobs</Link></li>
                                <li><Link to="/browse" className='hover:text-[#6A38C2] transition-colors'>Browse</Link></li>
                                <li><Link to="/saved-jobs" className='hover:text-[#6A38C2] transition-colors'>Saved Jobs</Link></li>
                                <li><Link to="/job-alerts" className='hover:text-[#6A38C2] transition-colors'>Job Alerts</Link></li>
                                {user && user.role === 'student' && (
                                    <li><Link to="/student/interviews" className='hover:text-[#6A38C2] transition-colors'>Interviews</Link></li>
                                )}
                            </ul>
                        </>
                    )}

                    {!user ? (
                        <div className='flex items-center gap-2'>
                            <Link to="/login">
                                <Button variant="outline" className='border-[#6A38C2] text-[#6A38C2] hover:bg-[#6A38C2] hover:text-white'>Login</Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="bg-[#6A38C2] hover:bg-[#5b30a6]">Signup</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className='flex items-center gap-4'>
                            {/* Socket Connection Status */}
                            {user && <SocketIndicator className="mr-1" />}

                            {/* Messages Link */}
                            <Link to="/messages" className='relative'>
                                <Button variant="ghost" size="sm" className='hover:text-[#6A38C2]'>
                                    <MessageCircle size={20} />
                                </Button>
                            </Link>

                            {/* Notifications */}
                            <NotificationBell 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="cursor-pointer"
                            />
                            
                            {/* User Menu */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Avatar className="cursor-pointer border-2 border-gray-200 hover:border-[#6A38C2] transition-colors">
                                        <AvatarImage src={user?.profile?.profilePhoto} alt="@user" />
                                    </Avatar>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className=''>
                                        <div className='flex gap-2 space-y-2'>
                                            <Avatar className="cursor-pointer">
                                                <AvatarImage src={user?.profile?.profilePhoto} alt="@user" />
                                            </Avatar>
                                            <div>
                                                <h4 className='font-medium'>{user?.fullname}</h4>
                                                <p className='text-sm text-muted-foreground'>{user?.profile?.bio}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-col my-2 text-gray-600'>
                                            {user && user.role === 'student' && (
                                                <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                                    <User2 />
                                                    <Button variant="link"><Link to="/profile">View Profile</Link></Button>
                                                </div>
                                            )}
                                            <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                                <LogOut />
                                                <Button onClick={logoutHandler} variant="link">Logout</Button>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className='md:hidden flex items-center gap-2'>
                    {user && (
                        <>
                            <SocketIndicator />
                            <NotificationBell onClick={() => setShowNotifications(!showNotifications)} />
                        </>
                    )}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className='md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50'>
                    <div className='px-4 py-4 space-y-4'>
                        {user && user.role === 'recruiter' ? (
                            <>
                                <Link to="/admin/companies" onClick={handleLinkClick} className='block py-2 text-gray-700 hover:text-[#6A38C2] transition-colors'>Companies</Link>
                                <Link to="/admin/jobs" onClick={handleLinkClick} className='block py-2 text-gray-700 hover:text-[#6A38C2] transition-colors'>Jobs</Link>
                                <Link to="/recruiter/interviews" onClick={handleLinkClick} className='block py-2 text-gray-700 hover:text-[#6A38C2] transition-colors'>Interviews</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/" onClick={handleLinkClick} className='block py-2 text-gray-700 hover:text-[#6A38C2] transition-colors'>Home</Link>
                                <Link to="/jobs" onClick={handleLinkClick} className='block py-2 text-gray-700 hover:text-[#6A38C2] transition-colors'>Jobs</Link>
                                <Link to="/browse" onClick={handleLinkClick} className='block py-2 text-gray-700 hover:text-[#6A38C2] transition-colors'>Browse</Link>
                                <Link to="/saved-jobs" onClick={handleLinkClick} className='block py-2 text-gray-700 hover:text-[#6A38C2] transition-colors'>Saved Jobs</Link>
                                <Link to="/job-alerts" onClick={handleLinkClick} className='block py-2 text-gray-700 hover:text-[#6A38C2] transition-colors'>Job Alerts</Link>
                                <Link to="/messages" onClick={handleLinkClick} className='block py-2 text-gray-700 hover:text-[#6A38C2] transition-colors'>Messages</Link>
                                {user && user.role === 'student' && (
                                    <Link to="/student/interviews" onClick={handleLinkClick} className='block py-2 text-gray-700 hover:text-[#6A38C2] transition-colors'>Interviews</Link>
                                )}
                            </>
                        )}

                        {!user ? (
                            <div className='space-y-2 pt-4 border-t'>
                                <Link to="/login" onClick={handleLinkClick} className='block'>
                                    <Button variant="outline" className='w-full border-[#6A38C2] text-[#6A38C2] hover:bg-[#6A38C2] hover:text-white'>Login</Button>
                                </Link>
                                <Link to="/signup" onClick={handleLinkClick} className='block'>
                                    <Button className="w-full bg-[#6A38C2] hover:bg-[#5b30a6]">Signup</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className='space-y-2 pt-4 border-t'>
                                <div className='flex items-center gap-3 pb-3'>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user?.profile?.profilePhoto} alt="@user" />
                                    </Avatar>
                                    <div>
                                        <p className='font-medium text-gray-900'>{user?.fullname}</p>
                                        <p className='text-sm text-gray-500'>{user?.email}</p>
                                    </div>
                                </div>
                                {user && user.role === 'student' && (
                                    <Link to="/profile" onClick={handleLinkClick} className='block py-2 text-gray-700 hover:text-[#6A38C2] transition-colors'>
                                        <div className='flex items-center gap-2'>
                                            <User2 size={18} />
                                            View Profile
                                        </div>
                                    </Link>
                                )}
                                <button onClick={logoutHandler} className='flex items-center gap-2 py-2 text-gray-700 hover:text-red-600 transition-colors w-full text-left'>
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Notifications Panel */}
            {showNotifications && (
                <div className='absolute top-16 right-4 z-50'>
                    <NotificationCenter onClose={() => setShowNotifications(false)} />
                </div>
            )}
        </div>
    );
};


export default Navbar;
