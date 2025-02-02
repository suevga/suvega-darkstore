import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BoxIcon, IndianRupeeIcon, Package, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { useCategoryStore } from "../store/categoryStore.js";
import { useProductStore } from "../store/productStore.js";
import  useOrderStore from "../store/orderStore.js";

export default function DashboardPage() {
  const { totalCategoryCount } = useCategoryStore();
  const { totalProducts } = useProductStore()
  const { totalOrderCount } = useOrderStore();

  // Sample data for average order value
const avgOrderData = [
  { month: "Jan", value: 2500 },
  { month: "Feb", value: 2800 },
  { month: "Mar", value: 2400 },
  { month: "Apr", value: 2900 },
  { month: "May", value: 3100 },
  { month: "Jun", value: 2700 },
]

  const stats = [
    { 
      title: 'Total Revenue', 
      value: '12,345,000', 
      icon: IndianRupeeIcon,
      href: '/dashboard' 
    },
    { 
      title: 'Orders', 
      value: `${totalOrderCount}`, 
      icon: ShoppingCart,
      href: '/dashboard/orders' 
    },
    { 
      title: 'Products', 
      value: `${totalProducts}`, 
      icon: Package,
      href: '/dashboard/products' 
    },
    { 
      title: 'Categories', 
      value: `${totalCategoryCount}`, 
      icon: BoxIcon,
      href: '/dashboard/categories' 
    },
  ];

  return (
    <div className="container mx-auto px-4">
    <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Link to={stat.href} key={stat.title}>
          <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
        </Link>
      ))}
    </div>
    <div className="mt-10">
      <h1 className="text-2xl font-semibold mb-5">Average order value</h1>
      <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgOrderData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--foreground))" 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--foreground))" 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '4px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
      </Card>
    </div>
  </div>
  );
}