import { GetToken, route } from '@/api/route';
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react'
import UserTable from './UserTable';
import { Sidebar } from 'primereact/sidebar';
import { Chip } from 'primereact/chip';
import { Divider } from 'primereact/divider';
import { OverlayPanel } from 'primereact/overlaypanel';
import QRCode from 'react-qr-code';
import { formatTimeAgo } from '@/utils/formatTimeAgo';

function Users() {

  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiloading, setApiLoading] = useState(false);
  const [userForm, setUserForm] = useState<boolean>(false);
  const [VPNPeer, setVPNPeer] = useState({
    username: '',
    device_name: ''
  });

  const CreateVpn = async () => {
    console.log(VPNPeer);
    const { username, device_name } = VPNPeer;
    const response = await fetch(route.vpn_add(username, device_name), {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GetToken()}`,
      },
    }
  );
  }

  
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
  return (
    <div className='h-screen  w-full flex flex-col gap-4'>
      <div className='flex  p-4 justify-between items-center'>
      <h1>Users</h1>
      <Button onClick={() =>setUserForm(e => !e)}>Add User</Button>


      <Dialog open={userForm} onOpenChange={setUserForm}>
        <DialogContent>
          <DialogHeader>
        <DialogTitle>Create New VPN</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-4'>
        <div className="flex flex-col gap-2">
          <Input placeholder='Username' aria-describedby="username-help" value={VPNPeer.username} name='username' onChange={(e) => setVPNPeer(val => ({ ...val, [e.target.name]: e.target.value }))} />
          <small id="username-help">
            Enter username to Create VPN Peer.
          </small>
        </div>
        <div className="flex flex-col gap-2">
          <Input placeholder='Device Name' aria-describedby="device-name-help" value={VPNPeer.device_name} name='device_name' onChange={(e) => setVPNPeer(val => ({ ...val, [e.target.name]: e.target.value }))} />
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
      </div>

      <div>
      <UserTable />
      </div>

      {/* Sidebar */}

      <Sidebar visible={visible}
                onHide={() => setVisible(false)}
                position="left"
                className="w-full md:w-[900px] bg-zinc-900"
                style={{
                    transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
                    transform: animate ? 'translateX(0)' : 'translateX(-100%)',
                    opacity: animate ? 1 : 0,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100%',
                    zIndex: 1000,
                    overflow: 'hidden',
                }}
            >
                <div className='flex p-5 w-full'>
                    <div className="bg-zinc-900 w-full h-full p-2 rounded-md  border-2  ">
                        <div className="text-white">
                            <div className='flex lg:items-center items-end justify-between lg:flex-row flex-col pt-2 pb-4 gap-2'>
                                <div className="flex justify-between items-center lg:gap-2 gap-28">
                                    <h2 className="lg:text-xl font-bold">User Configuration</h2>
                                    {/* <Chip  className='p-0 h-5 rounded-xl px-2 text-[10px] text-black font-semibold'
                                        style={{
                                            backgroundColor: usersIp.ipStatus === 'online' ? 'var(--green-500)' : 'var(--red-500)',
                                        }} /> */}
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                    <h2 className="lg:text-base text-xs font-bold ">Created At</h2>
                                    {/* <Chip label={formatTimeAgo(usersIp.createdAt)} className='p-0 h-5 rounded-xl px-1 lg:text-[10px] text-[7px]' /> */}
                                </div>
                            </div>
                            <Divider className='m-0' />
                            <p className="my-4 lg:flex gap-2 lg:justify-between lg:items-center">
                                {/* <strong className="uppercase lg:text-lg text-xs">Configuration - {"(" + usersIp.id + ")"}</strong> */}
                                <div className="flex flex-col lg:flex-row lg:gap-2 gap-3 ">
                                    {/* <Button
                                        size='small'
                                        label="Download"
                                        icon="pi pi-download"
                                        onClick={() => downloadConfFile()}
                                        rounded severity='secondary' outlined
                                    />
                                    <Button size='small' onClick={(e) => op.current.toggle(e)} label="Show QR" icon="pi pi-qrcode" rounded severity='help' outlined />
                                    <OverlayPanel ref={op}>
                                        <QRCode value={usersIp.conf} />
                                    </OverlayPanel>
                                    <Button size='small' onClick={DeleteConfirm} label={seleteLoading ? "Deleteing..." : "Delete"} icon="pi pi-trash"
                                        rounded severity='danger' outlined loading={seleteLoading}

                                    /> */}
                                </div>
                            </p>
                        </div>
                    </div>
                </div>
            </Sidebar>
    </div>
  )
}

export default Users
