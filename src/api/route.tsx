import Cookies from 'universal-cookie';

export const GetToken = () => {
    const cookies = new Cookies();
    return cookies.get('access_token');
}

const BASE_PATH = import.meta.env.VITE_BASE_PATH;


export const route = {
    "auth_verify": `${BASE_PATH}/auth/verify-otp`,
    "auth_validate": `${BASE_PATH}/auth/validate`,
    "vpn_clients": `${BASE_PATH}/vpn/clients`,
    "vpn_client": (username: string) => `${BASE_PATH}/vpn/client/${username}`,
    "vpn_client_id": (username: string, id: string) => `${BASE_PATH}/vpn/client/${username}/${id}`,
    "vpn_add": (username: string, device_name: string) => `${BASE_PATH}/vpn/add/${username}/${device_name}`,
    "vpn_remove": (username: string, ip: string) => `${BASE_PATH}/vpn/remove/${username}/${ip}`,
    "vpn_transfer": (peer: string) => `${BASE_PATH}/vpn/peer/${peer}`,
    "vpn_ping": (ip: string) => `${BASE_PATH}/vpn/ping/${ip}`,
}