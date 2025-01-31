import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { GetToken, route } from "../../api/route";
import { ProgressSpinner } from "primereact/progressspinner";
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import { Chip } from "primereact/chip";
import { Badge } from "primereact/badge";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { OverlayPanel } from "primereact/overlaypanel";
import QRCode from 'react-qr-code';

export default function UserConfi() {
    const { user, id } = useParams<{ user: string, id: string }>();
    const toast: any = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<any>({});
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    const fetchUserData = async () => {
        if (!id || !user) {
            console.error("User parameter is missing");
            setError("User parameter is missing");
            return;
        }
        try {
            const response = await fetch(route.vpn_client_id(user!, id!), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GetToken()}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.message); // Adjust based on API response structure
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

    const [seleteLoading, setDeleteLoading] = useState(false);

    const DeletePeer = async () => {
        setDeleteLoading(true);
        try {
            const response = await fetch(route.vpn_remove(user!, users.ipAddress), {
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

    const op: any = useRef(null);
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
    console.log(users.conf)
    return (
        <div className="bg-zinc-900 w-full h-full p-2 rounded-md">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="text-white">
                <div className='flex items-center justify-between w-full pt-2 pb-4 gap-2'>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">User Configuration</h2>
                        <Badge value="online" severity="success" className="font-medium"></Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold ">Created At</h2>
                        <Chip label={formatTimeAgo(users.createdAt)} className='p-0 h-5 rounded-xl px-1 text-[10px]' />
                    </div>
                </div>
                <Divider className='m-0' />
                <p className="my-4 flex gap-2 justify-between items-center">
                    <strong className="uppercase">Configuration - {"(" + users.id + ")"}</strong>
                    <div className="flex gap-2">
                        <Button
                            size='small'
                            label="Download"
                            icon="pi pi-download"
                            onClick={() => downloadConfFile()}
                            rounded severity='secondary' outlined
                        />
                        <Button size='small' onClick={(e) => op.current.toggle(e)} label="Show QR" icon="pi pi-qrcode" rounded severity='help' outlined />
                        <OverlayPanel ref={op}>
                            <QRCode value={users.conf} />
                        </OverlayPanel>
                        <Button size='small' onClick={DeleteConfirm} label={seleteLoading ? "Deleteing..." : "Delete"} icon="pi pi-trash"
                            rounded severity='danger' outlined loading={seleteLoading}

                        />
                    </div>
                </p>
                <pre className="bg-gray-800 p-4 rounded-md font-normal text-sm relative">
                    {users.conf || "Configuration data not available"} {/* Fallback message if conf is undefined */}
                    <Button
                        label={copied ? "Copied" : "Copy"}
                        size="small"
                        icon={copied ? "pi pi-check" : "pi pi-clone text-[12px]"}
                        className="absolute top-2 right-2 text-[12px] p-2"
                        text
                        onClick={() => {
                            if (users.conf) { // Only proceed if users.conf is defined
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
                                toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'No configuration available to copy', life: 2000 });
                            }
                        }}
                    />
                </pre>

            </div>
        </div>
    )
}
