import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, DollarSign, Package, ShoppingCart } from 'lucide-react';

export default function DashboardPage() {

  const stats = [
    { 
      title: 'Total Revenue', 
      value: '$12,345', 
      icon: DollarSign 
    },
    { 
      title: 'Orders', 
      value: '23', 
      icon: ShoppingCart 
    },
    { 
      title: 'Products', 
      value: '156', 
      icon: Package 
    },
    { 
      title: 'Avg. Order Value', 
      value: '$78.90', 
      icon: BarChart 
    },
  ];

  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}