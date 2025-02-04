import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { Ripple } from "primereact/ripple";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { useParams } from "react-router";
import { GetToken, route } from "../../api/route";
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import UserTables from "./UserTables";
import {
  Badge,
  Check,
  Clipboard,
  Download,
  Loader2,
  QrCode,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

function UserOnly() {
  const { user } = useParams<{ user: string }>();
  const toast: any = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState([]);
  const [usersIp, setUsersIp] = useState<any>({});
  const [userForm, setUserForm] = useState<boolean>(false);
  const [DeviceName, setDeviceName] = useState("");
  const [apiloading, setApiLoading] = useState(false);
  const initialLoad = useRef(true); // Ref to track if it's the first load

  const fetchUserData = async (initial = false) => {
    if (initial) setLoading(true);
    if (!user) {
      console.error("User parameter is missing");
      setError("User parameter is missing");
      return;
    }
    try {
      const response = await fetch(route.vpn_client(user), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GetToken()}`,
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
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Could not load dashboard data",
        life: 3000,
      });
      setLoading(false);
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // Add event listener for custom 'peerDeleted' event
    const handlePeerDeleted = () => {
      fetchUserData();
    };
    document.addEventListener("peerDeleted", handlePeerDeleted);

    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener("peerDeleted", handlePeerDeleted);
    };
  }, [user]);

  useEffect(() => {
    console.log({ users });
    fetchUserData(true); // Initial load with loading effect
    initialLoad.current = false; // Reset initial load tracking after first fetch

    // Run IP and transfer updates every 5 seconds
    const interval = setInterval(fetchUserData, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [user]);

  const CreateVpn = async () => {
    setApiLoading(true);
    if (!user || !DeviceName) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please Enter the Username and Device Name",
        life: 3000,
      });
      setApiLoading(false);
      return;
    } else {
      try {
        const response = await fetch(route.vpn_add(user, DeviceName), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GetToken()}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status) {
            toast.current?.show({
              severity: "success",
              summary: "Success",
              detail: "New peer added successfully",
              life: 6000,
            });
            document.dispatchEvent(new Event("peerDeleted"));
            setApiLoading(false);
            setUserForm(false);
            setDeviceName("");
          } else {
            toast.current?.show({
              severity: "error",
              summary: "Error",
              detail: data.error,
              life: 3000,
            });
            setApiLoading(false);
          }
        } else {
          throw new Error("Failed to fetch dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Could not load dashboard data");
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Could not load dashboard data",
          life: 3000,
        });
        setApiLoading(false);
      }
    }
  };

  // sidebar section
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (visible) {
      // Trigger animation when sidebar becomes visible
      const timeout = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timeout); // Cleanup timeout on unmount
    } else {
      // Reset animation state when sidebar hides
      setAnimate(false);
    }
  }, [visible]);

  const accept = async () => {
    toast.current.show({
      severity: "info",
      summary: "Confirmed",
      detail: "You have accepted",
      life: 3000,
    });
    await DeletePeer();
  };

  const reject = () => {
    toast.current.show({
      severity: "warn",
      summary: "Rejected",
      detail: "You have rejected",
      life: 3000,
    });
  };

  const DeleteConfirm = () => {
    confirmDialog({
      message: "Do you want to delete this record?",
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept,
      reject,
    });
  };

  const op: any = useRef(null);
  const downloadConfFile = () => {
    const blob = new Blob([usersIp.conf], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${user}_${usersIp.deviceName.split(" ").join("_")}.conf`;
    link.click();
  };

  const [seleteLoading, setDeleteLoading] = useState(false);
  const DeletePeer = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(route.vpn_remove(user!, usersIp.ipAddress), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GetToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          // Emit custom event after deletion
          document.dispatchEvent(new Event("peerDeleted"));
          setDeleteLoading(false);
          setVisible(false);
        } else {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: data.error,
            life: 3000,
          });
          setDeleteLoading(false);
        }
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Could not load dashboard data");
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Could not load dashboard data",
        life: 3000,
      });
      setDeleteLoading(false);
    }
    setDeleteLoading(false);
  };

  if (error) {
    return (
      <div className="flex justify-content-center align-items-center h-screen">
        <Toast ref={toast} />
      </div>
    );
  }

  const handleDeviceClick = (user: any) => {
    setUsersIp(user);
    setVisible(true);
  };

  const handleCopy = () => {
    if (usersIp.conf) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Using Clipboard API
        navigator.clipboard
          .writeText(usersIp.conf)
          .then(() => {
            setCopied(true);
            toast.current?.show({
              severity: "success",
              summary: "Copied",
              detail: "Configuration copied to clipboard",
              life: 2000,
            });
            setTimeout(() => setCopied(false), 2000);
          })
          .catch((err) => {
            console.error("Failed to copy text:", err);
            toast.current?.show({
              severity: "error",
              summary: "Error",
              detail: "Failed to copy configuration",
              life: 2000,
            });
          });
      } else {
        // Fallback for browsers without Clipboard API
        const textarea = document.createElement("textarea");
        textarea.value = usersIp.conf;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          toast.current?.show({
            severity: "success",
            summary: "Copied",
            detail: "Configuration copied to clipboard",
            life: 2000,
          });
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Fallback copy failed:", err);
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to copy configuration",
            life: 2000,
          });
        }
        document.body.removeChild(textarea);
      }
    } else {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "No configuration available to copy",
        life: 2000,
      });
    }
  };

  return (
    <div className="lg:w-full h-full flex bg-zinc-900 ">
      <div className="w-full rounded-md h-full overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 z-20">
          <h1 className="text-center font-semibold text-xl pt-4">
            {user?.toUpperCase()}
          </h1>
        </div>
        <UserTables data={users} onDeviceClick={handleDeviceClick} />
      </div>
      <Drawer open={visible} onOpenChange={setVisible} direction="left">
      <DrawerContent className="w-full md:w-[900px] bg-zinc-900 fixed top-0 left-0 h-full z-50 overflow-hidden transition-transform">
        <div className="flex p-5 w-full">
          <div className="bg-zinc-900 w-full h-full p-2 rounded-md border-2">
            <div className="text-white">
              {/* Header Section */}
              <div className="flex lg:items-center items-end justify-between lg:flex-row flex-col pt-2 pb-4 gap-2">
                <div className="flex justify-between items-center lg:gap-2 gap-28">
                  <h2 className="lg:text-xl font-bold">User Configuration</h2>
                  <Badge className={`h-5 rounded-xl px-2 text-[10px] font-semibold ${
                    usersIp.ipStatus === "online" ? "bg-green-500 text-black" : "bg-red-500 text-black"
                  }`}>
                    {usersIp.ipStatus}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <h2 className="lg:text-base text-xs font-bold">Created At</h2>
                  <Badge className="h-5 rounded-xl px-1 text-[7px] lg:text-[10px]">
                    {formatTimeAgo(usersIp.createdAt)}
                  </Badge>
                </div>
              </div>

              {/* Divider */}
              <div className="border-b border-gray-700 my-4"></div>

              {/* Buttons Section */}
              <div className="my-4 lg:flex gap-2 lg:justify-between lg:items-center">
                <div className="flex flex-col lg:flex-row lg:gap-2 gap-3">
                  {/* Download Button */}
                  <Button size="sm" variant="outline" onClick={downloadConfFile}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>

                  {/* QR Code Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <QrCode className="mr-2 h-4 w-4" />
                        Show QR
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-4">
                      <QRCode value={usersIp.conf} className="w-32 h-32" />
                    </PopoverContent>
                  </Popover>

                  {/* Delete Button */}
                  <Button size="sm" variant="outline" onClick={DeleteConfirm} disabled={seleteLoading}>
                    {seleteLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Configuration Display */}
              <pre className="bg-gray-800 p-4 pt-8 lg:pt-4 rounded-md font-normal text-[10px] relative w-full overflow-hidden max-h-[300px]">
                {usersIp.conf || "Configuration data not available"}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-xs p-2"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </pre>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
    </div>
  );
}

export default UserOnly;

export const UserdBox = () => (
  <div className="flex justify-center items-center w-full h-full">
    <div className="flex flex-col gap-2 justify-center items-center">
      <span className="text-lg">Select the IP to View there details</span>
      <i className="pi pi-receipt text-3xl"></i>
    </div>
  </div>
);
