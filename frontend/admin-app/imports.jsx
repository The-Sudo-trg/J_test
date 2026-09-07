
import React, { useState, useMemo, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { stores, products, categories, seedOrders, riders, statusMeta } from "@/data";

import { useMarketplace, MarketplaceContext, money } from "@/context/MarketplaceContext";
import {
    ProductCard,
    StoreCard,
    OrderSummary,
    StoreDirectoryRow,
    OrderQueueRow,
    StoreName,
    AddressModal,
    AppLayout,
    SectionHeader,
    Pill,
    EmptyState,
    PageIntro,
    MetricCard,
    Status
} from "@/components";

import { 
    AnalyticsPage, 
    OperationsPage, 
    StoresOperationsPage, 
    ZonesPage, 
    DiscoverPage,
    BrowsePage,
    StoresPage, 
    CartPage, 
    CheckoutPage, 
    TrackingPage, 
    CustomerOrdersPage, 
    SellerOrdersPage, 
    SellerOverviewPage, 
    InventoryPage 
} from "@/pages";