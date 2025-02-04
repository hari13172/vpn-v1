import { Sidebar } from 'primereact/sidebar';
import { useEffect, useRef, useState } from "react";
import { GetToken, route } from "../../api/route";
import { ProgressSpinner } from "primereact/progressspinner";
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import QRCode from 'react-qr-code';
import { useNavigate } from "react-router";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UserConfSliderProps {
    visible: boolean;
    onHide: () => void;
    user: string;
    id: string;
}

const UserConfSlider: React.FC<UserConfSliderProps> = ({ visible, onHide, user, id }) => {
    const toast: any = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<any>({});
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const [seleteLoading, setDeleteLoading] = useState(false);
    const op: any = useRef(null);

    const fetchUserData = async () => {
        if (!id || !user) {
            console.warn("User or ID parameter is missing. Skipping fetch.");
            setError("User parameter is missing");
            return;
        }
        try {
            const response = await fetch(route.vpn_client_id(user, id), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GetToken()}`,
                },
            });
    
            if (response.ok) {
                const data = await response.json();
                setUsers(data.message);
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
        fetchUserData();
    }, [user, id]);

    const DeletePeer = async () => {
        setDeleteLoading(true);
        try {
            const response = await fetch(route.vpn_remove(user, users.ipAddress), {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GetToken()}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status) {
                    // Emit custom event after deletion
                    document.dispatchEvent(new Event('peerDeleted'));
                    setDeleteLoading(false);
                    navigate(`/dashboard/${user}`, { replace: true });
                } else {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: data.error, life: 3000 });
                    setDeleteLoading(false);
                }
            } else {
                throw new Error("Failed to fetch dashboard data");
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Could not load dashboard data");
            toast.current.show({ severity: 'error', summary: 'Error', detail: "Could not load dashboard data", life: 3000 });
            setDeleteLoading(false);
        }
        setDeleteLoading(false);
    }

    const accept = async () => {
        toast.current.show({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
        await DeletePeer();
    }

    const reject = () => {
        toast.current.show({ severity: 'warn', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
    }

    const DeleteConfirm = () => {
        confirmDialog({
            message: 'Do you want to delete this record?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept,
            reject
        });
    };

    const downloadConfFile = () => {
        const blob = new Blob([users.conf], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${user}_${users.deviceName.split(' ').join('_')}.conf`;
        link.click();
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-screen">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-content-center align-items-center h-screen">
                <Toast ref={toast} />
            </div>
        );
    }

    return (
        <Sidebar visible={visible}
            onHide={onHide}
            position="left"
            className="w-full md:w-[900px] bg-zinc-900"
            style={{
                transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
                transform: visible ? 'translateX(0)' : 'translateX(-100%)',
                opacity: visible ? 1 : 0,
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100%',
                zIndex: 1000,
                overflow: 'hidden',
            }}
        >
            <div className='flex p-5 w-full'>
                <div className="bg-zinc-900 w-full h-full p-2 rounded-md border-2">
                    <Toast ref={toast} />
                    <ConfirmDialog />
                    <div className="text-white">
                        <div className='flex lg:items-center items-end justify-between lg:flex-row flex-col pt-2 pb-4 gap-2'>
                            <div className="flex justify-between items-center lg:gap-2 gap-28">
                                <h2 className="lg:text-xl font-bold">User Configuration</h2>
                                <Input value={users.ipStatus} className='p-0 h-5 rounded-xl px-2 text-[10px] text-black font-semibold'
                                    style={{
                                        backgroundColor: users.ipStatus === 'online' ? 'var(--green-500)' : 'var(--red-500)',
                                    }} readOnly />
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                                <h2 className="lg:text-base text-xs font-bold">Created At</h2>
                                <Input value={formatTimeAgo(users.createdAt)} className='p-0 h-5 rounded-xl px-1 lg:text-[10px] text-[7px]' readOnly />
                            </div>
                        </div>
                        <p className="my-4 lg:flex gap-2 lg:justify-between lg:items-center">
                            <div className="flex flex-col lg:flex-row lg:gap-2 gap-3 ">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadConfFile()}
                                >
                                    <i className="pi pi-download mr-2"></i>Download
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => op.current.toggle(e)}
                                >
                                    <i className="pi pi-qrcode mr-2"></i>Show QR
                                </Button>
                                <div className={`relative ${visible ? 'block' : 'hidden'}`}>
                                    <QRCode value={users.conf} />
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={DeleteConfirm}
                                    disabled={seleteLoading}
                                >
                                    <i className="pi pi-trash mr-2"></i>{seleteLoading ? "Deleting..." : "Delete"}
                                </Button>
                            </div>
                        </p>
                        <pre className="bg-gray-800 p-4 pt-8 lg:pt-4 rounded-md font-normal text-[10px] relative w-full overflow-hidden max-h-[300px]">
                            {users.conf || "Configuration data not available"}
                            <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2 text-[12px] p-2"
                                onClick={() => {
                                    if (users.conf) {
                                        if (navigator.clipboard && navigator.clipboard.writeText) {
                                            // Using Clipboard API if available
                                            navigator.clipboard.writeText(users.conf)
                                                .then(() => {
                                                    setCopied(true);
                                                    toast.current.show({ severity: 'success', summary: 'Copied', detail: 'Configuration copied to clipboard', life: 2000 });
                                                    setTimeout(() => setCopied(false), 2000);
                                                })
                                                .catch(err => {
                                                    console.error("Failed to copy text:", err);
                                                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to copy configuration', life: 2000 });
                                                });
                                        } else {
                                            // Fallback for browsers without Clipboard API
                                            const textarea = document.createElement("textarea");
                                            textarea.value = users.conf;
                                            textarea.style.position = "fixed";  // Avoid scrolling to bottom of the page
                                            textarea.style.opacity = "0"; // Make it invisible
                                            document.body.appendChild(textarea);
                                            textarea.select();
                                            try {
                                                document.execCommand("copy");
                                                setCopied(true);
                                                toast.current.show({ severity: 'success', summary: 'Copied', detail: 'Configuration copied to clipboard', life: 2000 });
                                                setTimeout(() => setCopied(false), 2000);
                                            } catch (err) {
                                                console.error("Fallback copy failed:", err);
                                                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to copy configuration', life: 2000 });
                                            }
                                            document.body.removeChild(textarea);
                                        }
                                    } else {
                                        toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'No configuration available to copy', life: 2000 });
                                    }
                                }}
                            >
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </pre>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
};

export default UserConfSlider;