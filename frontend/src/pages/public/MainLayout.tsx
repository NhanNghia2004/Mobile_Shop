import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CompareWidget from '../../components/CompareWidget';
import ChatWidget from '../../components/ChatWidget';

export default function MainLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            <CompareWidget />
            <ChatWidget />
        </div>
    );
}