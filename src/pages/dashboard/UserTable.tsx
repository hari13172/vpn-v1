import { useEffect, useState, useRef } from 'react';
import { GetToken, route } from '../../api/route';
import { Toast } from 'primereact/toast';
import { AgGridReact } from 'ag-grid-react';
import { useNavigate } from 'react-router';
import { Menu } from 'primereact/menu';

import 'ag-grid-community/styles/ag-theme-alpine.css';

import { themeQuartz } from 'ag-grid-community';

import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Mark all grids as using legacy themes
provideGlobalGridOptions({ theme: "legacy" });

const UserTable = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const toast = useRef<any>(null);
    const navigate = useNavigate();
    const gridApi = useRef<any>(null);

    // to use myTheme in an application, pass it to the theme grid option
    const myTheme = themeQuartz
        .withParams({
            backgroundColor: "#1f2836",
            browserColorScheme: "dark",
            chromeBackgroundColor: {
                ref: "foregroundColor",
                mix: 0.07,
                onto: "backgroundColor"
            },
            foregroundColor: "#FFF",
            headerFontSize: 14
        });


    const fetchUserData = async () => {
        try {
            const response = await fetch(route.vpn_clients, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GetToken()}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const usersData = data.message.map((username: string) => ({ username })); // Adjust API response structure
                setUsers(usersData);
                localStorage.setItem('users', JSON.stringify(usersData));
                setLoading(false);
            } else {
                throw new Error("Failed to fetch user data");
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Could not load user data");
            toast.current.show({ severity: 'error', summary: 'Error', detail: "Could not load user data", life: 3000 });
            setLoading(false);
        }
    };

    const deleteUser = async (username: string, ip: string) => {
        try {
            const response = await fetch(route.vpn_remove(username, ip), {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GetToken()}`,
                },
            });

            if (response.ok) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'User deleted successfully',
                    life: 3000,
                });

                // Remove the user from the state immediately
                setUsers((prevUsers) => {
                    const updatedUsers = prevUsers.filter((user) => user.username !== username);
                    console.log('Updated Users:', updatedUsers); // Debugging
                    return updatedUsers;
                });

                // Refresh the grid
                gridApi.current?.refreshCells();
            } else {
                throw new Error('Failed to delete user');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Could not delete user',
                life: 3000,
            });
        }
    };

    useEffect(() => {
        fetchUserData();

        const handleUserAdded = () => {
            fetchUserData();
        };

        document.addEventListener('userAdded', handleUserAdded);

        return () => {
            document.removeEventListener('userAdded', handleUserAdded);
        };
    }, []);

    const UsernameRenderer = (props: any) => {
        const handleClick = () => {
            localStorage.setItem('activeUserID', props.data.username);
            navigate(`/users/${props.data.username}`);
        };

        return (
            <span
                style={{ cursor: 'pointer', color: 'Black', textDecoration: 'none' }}
                onClick={handleClick}
            >
                {props.value}
            </span>
        );
    };

    const KebabMenuRenderer = (props: any) => {
        const menu = useRef<Menu>(null);

        const items = [
            {
                label: 'Delete',
                icon: 'pi pi-trash',
                command: () => {
                    deleteUser(props.data.username, props.data.ip);
                },
            },

            {
                label: 'View',
                icon: 'pi pi-eye',
                command: () => {
                    localStorage.setItem('activeUserID', props.data.username);
                    navigate(`/dashboard/${props.data.username}`);
                }
            },
        ];

        return (
            <div>
                <i className="pi pi-ellipsis-v" style={{ cursor: 'pointer' }} onClick={(event) => menu.current?.toggle(event)}></i>
                <Menu model={items} popup ref={menu} />
            </div>
        );
    };

    const columnDefs = [
        { headerName: "Username", field: "username", sortable: true, filter: true, cellRenderer: 'usernameRenderer' },
        { headerName: "Actions", field: "actions", cellRenderer: 'kebabMenuRenderer', width: 100 },
    ];

    const frameworkComponents = {
        usernameRenderer: UsernameRenderer,
        kebabMenuRenderer: KebabMenuRenderer,
    };

    const onGridReady = (params: any) => {
        gridApi.current = params.api;
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <div className="myTheme" style={{ height: 700, width: "100%" }} >
                <AgGridReact
                    rowData={users}
                    columnDefs={columnDefs}
                    components={frameworkComponents}
                    animateRows={true} // Enable row animation for better visual feedback
                    onGridReady={onGridReady}
                    theme={myTheme}
                />
            </div>
        </div>
    );
};

export default UserTable;
