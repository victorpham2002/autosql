import ReactPortal from "./ReactPortal";
import React , { useEffect } from "react"

interface FavoriteModalProps{
    // children: React.ReactChildren | React.ReactChild
    children: React.ReactNode,
    isOpen: boolean,
    handleClose:() => void;
}

const FavoriteModal = ({
    children,
    isOpen,
    handleClose
}: FavoriteModalProps) => {
    useEffect(() => {
        const closeOnEscapeKey = (e: KeyboardEvent) => 
        e.key === 'Escape' ? handleClose() : null;
        document.body.addEventListener('keydown', closeOnEscapeKey)
        return () => {
            document.body.removeEventListener('keydown', closeOnEscapeKey)
        }
    },[handleClose])
    useEffect(() => {
        document.body.style.overflow = 'hidden' 
        return () : void => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <ReactPortal wrapperId="react-portal-modal-container">
            <>
                <div className="fixed top-0 left-0 w-screen h-screen bg-black opacity-50 z-40" onClick={handleClose}/>
                <div className="fixed rounded flex flex-col box-border overflow-hidden p-5 z-50 bg-background inset-y-32 inset-x-32">
                    <button onClick={handleClose} className="py-2 px-8 self-end bg-button hover:bg-red-300  rounded-xl">Close</button>
                    <div className="box-border h-5/6">{children}</div>
                </div>
            </>
        </ReactPortal>
    )
}

export default FavoriteModal
