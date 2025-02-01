import { Sidebar } from 'primereact/sidebar';
import UserConf from './UserConf';

interface UserConfSliderProps {
    visible: boolean;
    onHide: () => void;
    user: string;
    id: string;
}

const UserConfSlider: React.FC<UserConfSliderProps> = ({ visible, onHide, user, id }) => {
    return (
        <Sidebar visible={visible} onHide={onHide} position="left" className="w-full md:w-[900px] bg-zinc-900">
            <UserConf user={user} id={id} />
        </Sidebar>
    );
};

export default UserConfSlider;