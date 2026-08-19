export interface ProductStatus {

    [key: string]: any;
}

export interface VariantImageResponse {
    id: number;
    imageUrl: string;
    displayOrder: number;
}

export interface VariantResponse {
    id: number;
    storage: number;
    color: string;
    colorHex: string;
    price: number;
    discountPrice: number;
    discountPercent: number;
    stockQuantity: number;
    images: string[];
    variantImages: VariantImageResponse[];
    status: string; // ProductStatus
}

export interface ProductResponse {
    id: number;
    name: string;
    brand: string;
    description: string;
    imageUrl: string;
    category: string;
    os: string;
    ram: number;
    screenSize: number;
    batteryCapacity: number;
    status: string; // ProductStatus

    // Thống kê
    soldCount: number;
    rating: number;
    reviewCount: number;
    createdAt: string;

    // Giá hiển thị
    minPrice: number;
    maxPrice: number;

    // Tổng tồn kho
    totalStock: number;
    inStock: boolean;

    // Màu + dung lượng có sẵn
    availableColors: string[];
    availableStorages: number[];

    // Toàn bộ variants
    variants: VariantResponse[];
}

export interface PageResponse<T> {
    content: T[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}
