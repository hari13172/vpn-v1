import { useEffect, useRef, useState } from 'react';
import { GetToken, route } from '../../api/route';
import { Outlet, useNavigate } from 'react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Layout from '../layout';


// Helper hook to detect screen width
const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [matches, query]);

    return matches;
};

const Dashboard = () => {
    const isMobile = useMediaQuery("(max-width: 640px)"); // Detects if screen width is <= 640px
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const toast: any = useRef(null);
    const [userForm, setUserForm] = useState<boolean>(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile); // Collapsed by default on mobile
    const [VPNPeer, setVPNPeer] = useState({
        username: '',
        device_name: ''
    });
    const [apiloading, setApiLoading] = useState(false);
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const response = await fetch(route.vpn_clients, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GetToken()}`,
                },
            });

            if (response.ok) {
                setLoading(false);
            } else {
                throw new Error("Failed to fetch dashboard data");
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Could not load dashboard data");
            toast.current.show({ severity: 'error', summary: 'Error', detail: "Could not load dashboard data", life: 3000 });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const CreateVpn = async () => {
        setApiLoading(true);
        const { username, device_name } = VPNPeer;
        if (!username || !device_name) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: "Please Enter the Username and Device Name", life: 3000 });
            setApiLoading(false);
            return;
        } else {
            try {
                const response = await fetch(route.vpn_add(username, device_name), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${GetToken()}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status) {
                        toast.current.show({ severity: 'success', summary: 'Success', detail: data.message, life: 3000 });
                        document.dispatchEvent(new Event('userAdded')); // Dispatch custom event
                        setApiLoading(false);
                        setUserForm(false);
                        setVPNPeer({ device_name: '', username: '' });
                    } else {
                        toast.current.show({ severity: 'error', summary: 'Error', detail: data.error, life: 3000 });
                        setApiLoading(false);
                    }
                } else {
                    throw new Error("Failed to fetch dashboard data");
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Could not load dashboard data");
                toast.current.show({ severity: 'error', summary: 'Error', detail: "Could not load dashboard data", life: 3000 });
                setApiLoading(false);
            }
        }
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => !prev);
    };

    const navigateToUserTable = () => {
        navigate('/dashboard/usertable');
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full gap-4">
                <div className='w-[30%]'>
                    <Skeleton className="w-[100px] h-[20px] rounded-full" />
                </div>
                <Skeleton className="w-[100px] h-[20px] rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-content-center align-items-center h-screen">
                {/* <Toast ref={toast} /> */}
            </div>
        );
    }

    return (
        <div className='flex gap-4 w-full h-screen overflow-hidden p-4 '>
            {/* <Toast ref={toast} /> */}
            <div className={`flex flex-col p-2 bg-zinc-900 ${sidebarCollapsed ? 'w-20' : 'w-56'} rounded-md transition-all duration-300`}>
                {/* Hamburger Menu, visible only for mobile */}
                {isMobile && (
                    <button
                        className='text-center flex justify-center items-center'
                        onClick={toggleSidebar}
                        aria-label="Toggle Sidebar"
                        style={{
                            background: 'none', // Remove background
                            border: 'none',     // Remove border
                            cursor: 'pointer',  // Pointer cursor for clarity
                            padding: '0',       // No padding around the icon
                        }}
                    >
                        {sidebarCollapsed ? (
                            // Hamburger icon when sidebar is collapsed
                            <svg width="30" height="34" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        ) : (
                            // Close icon when sidebar is expanded
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>
                )}

                {/* Sidebar Content */}
                {/* {!sidebarCollapsed && <h1 className='text-center font-semibold text-xl mt-2'>VPN Users</h1>}
                 */}
                 <Layout />
                {/* <Divider /> */}

                <div className='flex flex-col gap-4 flex-1 w-full rounded-md'>
                    <Button
                        variant="outline"
                        size='sm'
                        className={`w-full text-xs ${sidebarCollapsed ? 'rounded-full' : ''}`}
                        onClick={() => setUserForm(e => !e)}
                    >
                        {!sidebarCollapsed ? "Add New User" : ""}
                    </Button>

                    <Dialog open={userForm} onOpenChange={setUserForm}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New VPN</DialogTitle>
                            </DialogHeader>
                            <div className='flex flex-col gap-4'>
                                <div className="flex flex-col gap-2">
                                    <Input placeholder='Username' value={VPNPeer.username} name='username' onChange={(e) => setVPNPeer(val => ({ ...val, [e.target.name]: e.target.value }))} />
                                    <small id="username-help">
                                        Enter username to Create VPN Peer.
                                    </small>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Input placeholder='Device Name' value={VPNPeer.device_name} name='device_name' onChange={(e) => setVPNPeer(val => ({ ...val, [e.target.name]: e.target.value }))} />
                                    <small id="device-name-help">
                                        Enter Device Name to Attach Through the VPN Peer.
                                    </small>
                                </div>
                                <Button onClick={CreateVpn} disabled={apiloading}>
                                    {apiloading ? "Creating..." : "Create VPN"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button
                        variant="default"
                        className="w-full"
                        onClick={navigateToUserTable}
                    >
                        Show Users
                    </Button>
                </div>
            </div>
            <div className='flex-1 rounded-md'>
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;

export const DashboardBox = () => (
    <div className='flex justify-center items-center w-full h-full bg-zinc-900'>
        <div className='flex flex-col gap-2 justify-center items-center'>
            <span className='text-lg'>Select the User to View their details</span>
            <i className='pi pi-user text-3xl'></i>
        </div>
    </div>
);