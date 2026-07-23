import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CompareWidget from '../../components/CompareWidget';
import ChatboxWidget from '../../components/ChatboxWidget';

export default function MainLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            <CompareWidget />
            <ChatboxWidget />
        </div>
    );
}