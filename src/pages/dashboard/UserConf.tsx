import { useEffect, useRef, useState } from "react";
import { GetToken, route } from "../../api/route";
import { ProgressSpinner } from "primereact/progressspinner";
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router";
import {
  Check,
  Clipboard,
  Download,
  Loader2,
  QrCode,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface UserConfProps {
  user: string;
  id: string;
}

const UserConf: React.FC<UserConfProps> = ({ user, id }) => {
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
      const response = await fetch(route.vpn_client_id(user, id), {
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
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user, id]);

  const [seleteLoading, setDeleteLoading] = useState(false);

  const DeletePeer = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(route.vpn_remove(user, users.ipAddress), {
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
          navigate(`/dashboard/${user}`, { replace: true });
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
    const blob = new Blob([users.conf], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${user}_${users.deviceName.split(" ").join("_")}.conf`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center h-screen">
        <ProgressSpinner
          style={{ width: "50px", height: "50px" }}
          strokeWidth="8"
        />
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
  console.log(users.conf);

  const handleCopy = () => {
    if (users.conf) {
      navigator.clipboard
        .writeText(users.conf)
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
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "No configuration available to copy",
        life: 2000,
      });
    }
  };

  return (
    <div className="bg-zinc-900 w-full h-full p-2 rounded-md">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="text-white">
        <div className="flex items-center justify-between w-full pt-2 pb-4 gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">User Configuration</h2>
            <Badge
              variant="outline"
              className="font-medium text-green-600 border-green-600"
            >
              Online
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold ">Created At</h2>
            <Badge className="h-5 rounded-xl px-1 text-[10px]">
              {formatTimeAgo(users.createdAt)}
            </Badge>
          </div>
        </div>
        <Divider className="m-0" />
        <p className="my-4 flex gap-2 justify-between items-center">
          <strong className="uppercase">
            Configuration - {"(" + users.id + ")"}
          </strong>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadConfFile()}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => op.current.toggle(e)}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Show QR
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Show QR
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-4">
                <QRCode value={users.conf} className="w-32 h-32" />
              </PopoverContent>
            </Popover>
            <Button
              size="sm"
              variant="outline"
              onClick={DeleteConfirm}
              disabled={seleteLoading}
            >
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
        </p>
        <pre className="bg-gray-800 p-4 rounded-md font-normal text-sm relative">
          {users.conf || "Configuration data not available"}{" "}
          {/* Fallback message if conf is undefined */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 text-xs p-2"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Clipboard className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </pre>
      </div>
    </div>
  );
};

export default UserConf;
