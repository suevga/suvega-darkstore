import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, BoxIcon, DollarSign, IndianRupeeIcon, Package, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {

  const stats = [
    { 
      title: 'Total Revenue', 
      value: '12,345,000', 
      icon: IndianRupeeIcon,
      href: '/dashboard' 
    },
    { 
      title: 'Orders', 
      value: '5000', 
      icon: ShoppingCart,
      href: '/dashboard/orders' 
    },
    { 
      title: 'Products', 
      value: '3000', 
      icon: Package,
      href: '/dashboard/products' 
    },
    { 
      title: 'Categories', 
      value: '1575', 
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
  </div>
  );
}