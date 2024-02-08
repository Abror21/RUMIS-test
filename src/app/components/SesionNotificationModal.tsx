'use client'

import { Button, Modal, Typography } from "antd";
import { useTimer } from "./TimerContext";
import { usePathname } from "next/navigation";

const { Title } = Typography;

const SesionNotificationModal = () => {
    const { count, running, startTimer, resetTimer, showNotification } = useTimer();

    const pathname = usePathname();

    return (
        <Modal
            open={showNotification && running}
            footer={false}
        >
            <Title level={4}>Sesija drīz beigsies! Ja vēlaties pagarināt sesiju, piespiediet zemāk esošo pogu.</Title>
            <div className="flex justify-center">
                <Button 
                    onClick={() => window.location.href = pathname ?? '/'}
                    type="primary"
                >
                    Pagarināt
                </Button>
            </div>
        </Modal>
    )
}

export default SesionNotificationModal