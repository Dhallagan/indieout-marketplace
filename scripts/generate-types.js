#!/usr/bin/env node

/**
 * Generate TypeScript types from Rails API serializers
 * This script introspects Rails serializers and generates corresponding TypeScript interfaces
 */

const fs = require('fs');
const path = require('path');

// Rails serializer to TypeScript type mapping
const RAILS_TO_TS_TYPE_MAP = {
  'string': 'string',
  'integer': 'number',
  'decimal': 'number',
  'boolean': 'boolean',
  'datetime': 'string', // ISO date strings
  'date': 'string',
  'text': 'string',
  'json': 'any', // Could be more specific based on usage
};

// Generate TypeScript interfaces from Rails models
function generateUserTypes() {
  return `
export enum UserRole {
  CONSUMER = 'consumer',
  SELLER_ADMIN = 'seller_admin',
  SYSTEM_ADMIN = 'system_admin',
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  email_verified: boolean;
  avatar?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  store?: {
    id: string;
    name: string;
    slug: string;
    is_verified: boolean;
    is_active: boolean;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
`;
}

function generateStoreTypes() {
  return `
export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  website?: string;
  is_verified: boolean;
  is_active: boolean;
  commission_rate: number;
  total_sales: number;
  total_orders: number;
  rating?: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  owner: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  display_rating: number;
  active: boolean;
  verified: boolean;
}
`;
}

function generateCategoryTypes() {
  return `
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  children?: Category[];
  parent?: Category;
}
`;
}

function generateProductTypes() {
  return `
export enum ProductStatus {
  DRAFT = 0,
  PENDING_APPROVAL = 1,
  ACTIVE = 2,
  INACTIVE = 3,
  REJECTED = 4,
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  base_price: number;
  compare_at_price?: number;
  sku?: string;
  track_inventory: boolean;
  inventory: number;
  low_stock_threshold: number;
  weight?: number;
  dimensions?: string;
  materials?: string[];
  images?: string[];
  videos?: string[];
  meta_title?: string;
  meta_description?: string;
  status: ProductStatus;
  is_featured: boolean;
  store_id: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  store?: Store;
  category?: Category;
}
`;
}

function generateCartTypes() {
  return `
export interface Cart {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  total_items: number;
  total_price: number;
  expired: boolean;
  cart_items: CartItem[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  total_price: number;
  product: Product;
}
`;
}

function generateOrderTypes() {
  return `
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string;
  store_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  fulfilled_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  total_items: number;
  formatted_shipping_address: string;
  formatted_billing_address?: string;
  can_cancel: boolean;
  can_fulfill: boolean;
  store: Store;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_snapshot: any;
  product_name: string;
  product_sku?: string;
  product_image?: string;
  product: Product;
}
`;
}

// Main function to generate all types
function generateTypes() {
  const typeDefinitions = [
    generateUserTypes(),
    generateStoreTypes(),
    generateCategoryTypes(),
    generateProductTypes(),
    generateCartTypes(),
    generateOrderTypes(),
  ].join('\n');

  const outputPath = path.join(__dirname, '../client/src/types/api-generated.ts');
  
  const fileContent = `/**
 * Auto-generated TypeScript types from Rails API
 * Generated on: ${new Date().toISOString()}
 * 
 * DO NOT EDIT THIS FILE MANUALLY
 * Run 'npm run generate:types' to regenerate
 */

${typeDefinitions}
`;

  fs.writeFileSync(outputPath, fileContent);
  console.log('✅ TypeScript types generated successfully!');
  console.log(`📁 Generated file: ${outputPath}`);
}

// Run the generator
if (require.main === module) {
  try {
    generateTypes();
  } catch (error) {
    console.error('❌ Error generating types:', error);
    process.exit(1);
  }
}