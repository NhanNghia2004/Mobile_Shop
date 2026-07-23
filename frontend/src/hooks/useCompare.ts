import { useState, useEffect } from 'react';

export interface CompareItem {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
}

const MAX_COMPARE_ITEMS = 3;
const STORAGE_KEY = 'compareList';

export function useCompare() {
    const [compareList, setCompareList] = useState<CompareItem[]>([]);

    const loadCompareList = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                setCompareList(JSON.parse(data));
            } else {
                setCompareList([]);
            }
        } catch (e) {
            setCompareList([]);
        }
    };

    useEffect(() => {
        loadCompareList();

        const handleCompareUpdated = () => {
            loadCompareList();
        };

        window.addEventListener('compareUpdated', handleCompareUpdated);
        return () => {
            window.removeEventListener('compareUpdated', handleCompareUpdated);
        };
    }, []);

    const addToCompare = (item: CompareItem) => {
        const currentList = [...compareList];
        if (currentList.find(i => i.id === item.id)) {
            // Đã có trong danh sách -> bỏ qua
            return { success: false, message: 'Sản phẩm đã có trong danh sách so sánh.' };
        }
        
        if (currentList.length >= MAX_COMPARE_ITEMS) {
            return { success: false, message: `Chỉ có thể so sánh tối đa ${MAX_COMPARE_ITEMS} sản phẩm cùng lúc.` };
        }

        currentList.push(item);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
        window.dispatchEvent(new Event('compareUpdated'));
        return { success: true, message: 'Đã thêm vào danh sách so sánh.' };
    };

    const removeFromCompare = (id: number) => {
        const currentList = compareList.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
        window.dispatchEvent(new Event('compareUpdated'));
    };

    const clearCompare = () => {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event('compareUpdated'));
    };

    const isInCompareList = (id: number) => {
        return compareList.some(item => item.id === id);
    };

    return {
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompareList,
        MAX_COMPARE_ITEMS
    };
}
