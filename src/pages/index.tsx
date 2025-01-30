
import { Button } from '@/components/ui/button';


export default function Root() {
    // const navigate = useNavigate();
    return (
        <div className="flex justify-center items-center w-full h-screen bg-black text-white">
            <div className="flex flex-col gap-5 justify-center items-center p-4 max-w-5xl w-full">
                <h1 className="text-3xl font-bold">VPN SERVER</h1>
                <div className="text-center">
                    <p className="text-lg">
                        Our VPN server ensures your internet connection is secure and private.
                        It encrypts your data, hides your IP address, and allows you to access content safely from anywhere in the world.
                    </p>
                </div>

                {/* <Button size='small' onClick={() => navigate('/auth/login')}>Get Started</Button> */}
                <Button variant="destructive" onClick={() =>('')}>Get Started</Button>
            </div>
        </div>
    )
}