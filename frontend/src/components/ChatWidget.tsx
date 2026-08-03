import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AiChatbot from './AiChatbot';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-16 right-0 w-[360px] flex flex-col overflow-hidden"
                        style={{ height: '480px' }}
                    >
                        <AiChatbot onClose={() => setIsOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(79,70,229,0.4)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.5)] transition-shadow relative"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </motion.button>
        </div>
    );
}
