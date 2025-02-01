import 'ag-grid-community/styles/ag-grid.css'; // AG Grid Core CSS
import 'ag-grid-community/styles/ag-theme-alpine.css'; // AG Grid Theme CSS

import { AgGridReact } from 'ag-grid-react';
import { useEffect, useRef, useState } from 'react';
import { Menu } from 'primereact/menu';
import { FiMoreVertical } from 'react-icons/fi'; // Importing ShadCN icon
import LineChart from './LineChart';
import UserConfSlider from './UserConfSlider';
import { Button } from 'primereact/button';

function ActionMenuRenderer({ params, onEdit }: { params: any, onEdit: () => void }) {
    const menu = useRef<Menu>(null);
    const items = [
        { label: 'Edit', icon: 'pi pi-pencil', command: onEdit },
        { label: 'Delete', icon: 'pi pi-trash', command: () => { /* Delete action */ } },
    ];

    return (
        <div className='relative'>
            <Menu model={items} popup ref={menu} className=''/>
            <FiMoreVertical onClick={(event) => menu.current && menu.current.toggle(event)} style={{ cursor: 'pointer' }} />
        </div>
    );
}

function UserTables({ data }: { data: any; }) {
    const [rowData, setRowData] = useState<any>([]);
    const [selectedUser, setSelectedUser] = useState<{ user: string, id: string } | null>(null);
    const [visible, setVisible] = useState(false);

    // Maintain a map for chart data queues (latest 10 data points per row and column)
    const chartDataMap = useRef<{ [key: string]: { received: any[]; sent: any[]; }; }>({});

    useEffect(() => {
        if (!data || data.length === 0) return;

        const throttledUpdate = setTimeout(() => {
            setRowData(() => {
                return data.map((row: any) => {
                    const key = row.deviceName;

                    if (!chartDataMap.current[key]) {
                        chartDataMap.current[key] = { received: [], sent: [] };
                    }

                    // Update received data queue
                    chartDataMap.current[key].received = [
                        ...chartDataMap.current[key].received,
                        { time: new Date().toLocaleTimeString(), value: (row.transfer?.transfer_received)?.split(' ')[0] || 0, type: 'receiver' },
                    ].slice(-10);

                    // Update sent data queue
                    chartDataMap.current[key].sent = [
                        ...chartDataMap.current[key].sent,
                        { time: new Date().toLocaleTimeString(), value: (row.transfer?.transfer_sent)?.split(' ')[0] || 0, type: 'sender' },
                    ].slice(-10);

                    return row;
                });
            });
        }, 500); // Throttle updates to every 500ms

        return () => clearTimeout(throttledUpdate); // Cleanup timeout
    }, [data]);

    const ChartRenderer = (params: any) => {
        const key = params.data.deviceName;
        const chartType = params.colDef.field.includes("received") ? "received" : "sent";

        if (!chartDataMap.current[key]) {
            return <span>No Data</span>;
        }

        const chartData = chartDataMap.current[key][chartType];
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <LineChart chartData={[...chartData]} /> {/* Spread to prevent mutation */}
            </div>
        );
    };

    const [columnDefs] = useState([
        { field: "deviceName", headerName: "Device Name", sortable: true, filter: true },
        { field: "ipAddress", headerName: "IP Address", sortable: true, filter: true },
        { field: "ipStatus", headerName: "IP Status", sortable: true, filter: true },
        { field: "transfer.endpoint", headerName: "Transfer Endpoint", sortable: true, filter: true },
        { field: "transfer.allowed_ips", headerName: "Allowed IPs", sortable: true, filter: true },
        { field: "transfer.latest_handshake", headerName: "Latest Handshake", sortable: true, filter: true },
        {
            field: "transfer.transfer_received",
            headerName: "Received Data",
            cellRenderer: ChartRenderer,
            width: 200
        },
        {
            field: "transfer.transfer_sent",
            headerName: "Sent Data",
            cellRenderer: ChartRenderer,
            width: 200
        },
        {
            field: "actions",
            headerName: "Actions",
            cellRendererFramework: (params: any) => (
                <ActionMenuRenderer
                    params={params}
                    onEdit={() => {
                        setSelectedUser({ user: params.data.user, id: params.data.id });
                        setVisible(true);
                    }}
                />
            ),
            width: 100
        },
    ]);

    return (
        <div>
            <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
                <AgGridReact
                    rowData={rowData} // Pass the state-managed row data
                    rowHeight={64}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={10}
                    animateRows={true} // Enable row animation for better UX
                />
            </div>
            <Button
                label="Open Slider"
                icon="pi pi-external-link"
                onClick={() => {
                    setSelectedUser({ user: 'defaultUser', id: 'defaultId' }); // Set default user and id
                    setVisible(true);
                }}
                className="p-button-outlined"
            />
            {selectedUser && (
                <UserConfSlider 
                    visible={visible} 
                    onHide={() => setVisible(false)} 
                    user={selectedUser.user} 
                    id={selectedUser.id} 
                />
            )}
        </div>
    );
}

export default UserTables;