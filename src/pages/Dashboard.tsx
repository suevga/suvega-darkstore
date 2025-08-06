import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BoxIcon, IndianRupeeIcon, Package, ShoppingCart, TrendingUp, Users, Calendar, Activity, ArrowUpRight, ArrowDownRight, Search, Smartphone, Monitor, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { useCategoryStore } from '../store/categoryStore';
import { useProductStore } from '../store/productStore';
import useOrderStore from '../store/orderStore';
import { useDarkStore } from '../store/darkStore';

export default function DashboardPage() {
  const { totalCategoryCount } = useCategoryStore();
  const { totalProducts } = useProductStore();
  const { totalOrderCount } = useOrderStore();
  const { totalRevenue } = useDarkStore();

  // Sample data for revenue over time
  const revenueData = [
    { month: 'Jan', revenue: 45000, orders: 120, users: 1200 },
    { month: 'Feb', revenue: 52000, orders: 140, users: 1350 },
    { month: 'Mar', revenue: 48000, orders: 135, users: 1420 },
    { month: 'Apr', revenue: 61000, orders: 180, users: 1580 },
    { month: 'May', revenue: 55000, orders: 165, users: 1650 },
    { month: 'Jun', revenue: 67000, orders: 200, users: 1800 },
    { month: 'Jul', revenue: 58000, orders: 175, users: 1750 },
    { month: 'Aug', revenue: 72000, orders: 220, users: 1920 },
    { month: 'Sep', revenue: 65000, orders: 195, users: 1870 },
    { month: 'Oct', revenue: 78000, orders: 245, users: 2100 },
    { month: 'Nov', revenue: 82000, orders: 260, users: 2200 },
    { month: 'Dec', revenue: 89000, orders: 285, users: 2350 },
  ];

  // Sample data for order status distribution
  const orderStatusData = [
    { name: 'Completed', value: 65, fill: '#10b981' },
    { name: 'Processing', value: 20, fill: '#f59e0b' },
    { name: 'Cancelled', value: 10, fill: '#ef4444' },
    { name: 'Pending', value: 5, fill: '#6b7280' },
  ];

  // Sample data for top categories
  const topCategoriesData = [
    { category: 'Electronics', sales: 45000, orders: 180 },
    { category: 'Groceries', sales: 38000, orders: 250 },
    { category: 'Fashion', sales: 32000, orders: 120 },
    { category: 'Home & Garden', sales: 28000, orders: 95 },
    { category: 'Sports', sales: 22000, orders: 80 },
    { category: 'Books', sales: 18000, orders: 60 },
  ];

  // Sample data for daily orders
  const dailyOrdersData = [
    { day: 'Mon', orders: 25, revenue: 3200 },
    { day: 'Tue', orders: 32, revenue: 4100 },
    { day: 'Wed', orders: 28, revenue: 3600 },
    { day: 'Thu', orders: 45, revenue: 5800 },
    { day: 'Fri', orders: 52, revenue: 6700 },
    { day: 'Sat', orders: 38, revenue: 4900 },
    { day: 'Sun', orders: 22, revenue: 2800 },
  ];

  // Sample data for top products
  const topProductsData = [
    { product: 'iPhone 15', sales: 25000, units: 45, category: 'Electronics' },
    { product: 'Samsung TV', sales: 18000, units: 12, category: 'Electronics' },
    { product: 'Nike Shoes', sales: 15000, units: 60, category: 'Fashion' },
    { product: 'Coffee Beans', sales: 12000, units: 200, category: 'Groceries' },
    { product: 'Laptop Stand', sales: 8000, units: 80, category: 'Electronics' },
    { product: 'Yoga Mat', sales: 6000, units: 100, category: 'Sports' },
  ];

  // Sample data for customer demographics
  const customerDemographicsData = [
    { name: '18-25', value: 28, fill: '#8884d8' },
    { name: '26-35', value: 35, fill: '#82ca9d' },
    { name: '36-45', value: 22, fill: '#ffc658' },
    { name: '46-55', value: 12, fill: '#ff7c7c' },
    { name: '55+', value: 3, fill: '#8dd1e1' },
  ];

  // Sample data for sales by region
  const salesByRegionData = [
    { region: 'North', sales: 45000, orders: 320, percentage: 35 },
    { region: 'South', sales: 38000, orders: 280, percentage: 30 },
    { region: 'East', sales: 25000, orders: 180, percentage: 20 },
    { region: 'West', sales: 18000, orders: 120, percentage: 15 },
  ];

  // Sample data for monthly growth
  const monthlyGrowthData = [
    { month: 'Jan', revenue: 45000, growth: 8.5, orders: 120 },
    { month: 'Feb', revenue: 52000, growth: 15.6, orders: 140 },
    { month: 'Mar', revenue: 48000, growth: -7.7, orders: 135 },
    { month: 'Apr', revenue: 61000, growth: 27.1, orders: 180 },
    { month: 'May', revenue: 55000, growth: -9.8, orders: 165 },
    { month: 'Jun', revenue: 67000, growth: 21.8, orders: 200 },
  ];

  // Sample data for payment methods
  const paymentMethodsData = [
    { method: 'Credit Card', value: 45, fill: '#0088FE' },
    { method: 'Debit Card', value: 25, fill: '#00C49F' },
    { method: 'UPI', value: 20, fill: '#FFBB28' },
    { method: 'Net Banking', value: 7, fill: '#FF8042' },
    { method: 'Cash on Delivery', value: 3, fill: '#8884D8' },
  ];

  // Sample data for platform analytics
  const platformData = [
    { platform: 'Mobile', users: 65, orders: 450, revenue: 125000, fill: '#0088FE' },
    { platform: 'Desktop', users: 25, orders: 180, revenue: 52000, fill: '#00C49F' },
    { platform: 'Tablet', users: 10, orders: 70, revenue: 18000, fill: '#FFBB28' },
  ];

  // Sample data for top searched products
  const topSearchedData = [
    { product: 'iPhone 15', searches: 1250, conversions: 45, rate: 3.6 },
    { product: 'MacBook Pro', searches: 980, conversions: 28, rate: 2.9 },
    { product: 'AirPods Pro', searches: 850, conversions: 85, rate: 10.0 },
    { product: 'Samsung Galaxy', searches: 720, conversions: 32, rate: 4.4 },
    { product: 'Nike Air Max', searches: 640, conversions: 58, rate: 9.1 },
    { product: 'Coffee Machine', searches: 580, conversions: 42, rate: 7.2 },
  ];

  // Sample data for search trends
  const searchTrendsData = [
    { month: 'Jan', searches: 12500, clicks: 3800, conversions: 420 },
    { month: 'Feb', searches: 14200, clicks: 4100, conversions: 480 },
    { month: 'Mar', searches: 13800, clicks: 3950, conversions: 445 },
    { month: 'Apr', searches: 16500, clicks: 4800, conversions: 580 },
    { month: 'May', searches: 15200, clicks: 4450, conversions: 520 },
    { month: 'Jun', searches: 18000, clicks: 5200, conversions: 650 },
  ];

  // Sample performance metrics
  const performanceData = [
    { metric: 'Order Fulfillment Rate', value: 96, target: 100, fill: '#10b981', unit: '%' },
    { metric: 'Customer Satisfaction', value: 4.7, target: 5.0, fill: '#3b82f6', unit: '/5' },
    { metric: 'Return Rate', value: 3.2, target: 5.0, fill: '#f59e0b', unit: '%', inverse: true },
    { metric: 'Cart Abandonment', value: 68, target: 70, fill: '#ef4444', unit: '%', inverse: true },
    { metric: 'Email Open Rate', value: 24.5, target: 30.0, fill: '#8b5cf6', unit: '%' },
    { metric: 'Conversion Rate', value: 3.8, target: 5.0, fill: '#06b6d4', unit: '%' },
    { metric: 'Average Session Duration', value: 4.2, target: 5.0, fill: '#84cc16', unit: 'min' },
    { metric: 'Customer Retention', value: 72, target: 80, fill: '#f97316', unit: '%' },
    { metric: 'Inventory Turnover', value: 8.5, target: 10.0, fill: '#ec4899', unit: 'x/year' },
  ];

  // Calculate average order value
  const avgOrderValue = totalRevenue && totalOrderCount ? (totalRevenue / totalOrderCount) : 2850;

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue?.toLocaleString() || '0'}`,
      change: '+12.5%',
      trend: 'up',
      icon: IndianRupeeIcon,
      href: '/dashboard',
    },
    {
      title: 'Average Order Value',
      value: `₹${avgOrderValue?.toLocaleString() || '2,850'}`,
      change: '+6.3%',
      trend: 'up',
      icon: TrendingUp,
      href: '/dashboard',
    },
    {
      title: 'Products',
      value: `${totalProducts?.toLocaleString() || '0'}`,
      change: '+4.1%',
      trend: 'up',
      icon: Package,
      href: '/dashboard/products',
    },
    {
      title: 'Categories',
      value: `${totalCategoryCount?.toLocaleString() || '0'}`,
      change: '+2.3%',
      trend: 'up',
      icon: BoxIcon,
      href: '/dashboard/categories',
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">Last 30 days</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Link to={stat.href} key={stat.title} className="block">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center mt-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend - Takes 2 columns on large screens */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] sm:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] sm:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Order Value Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Average Order Value Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="hsl(var(--foreground))" tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--foreground))" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value) => [`₹${value.toLocaleString()}`]} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="product" stroke="hsl(var(--foreground))" axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="hsl(var(--foreground))" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']} />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCategoriesData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    stroke="hsl(var(--foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value/1000}k`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    stroke="hsl(var(--foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Orders & Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Weekly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="orders"
                    stroke="hsl(var(--foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="revenue"
                    orientation="right"
                    stroke="hsl(var(--foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="orders" dataKey="orders" fill="hsl(var(--primary))" name="Orders" />
                  <Line 
                    yAxisId="revenue" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#82ca9d" 
                    strokeWidth={3}
                    name="Revenue (₹)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row Charts - Platform & Search Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Platform Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="users" data={platformData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label />
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Searched Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Top Searched Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSearchedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="product" stroke="hsl(var(--foreground))" axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="hsl(var(--foreground))" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} formatter={(value) => [value, 'Searches']} />
                  <Bar dataKey="searches" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Customer Age Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" data={customerDemographicsData} cx="50%" cy="50%" outerRadius={80} label>
                    {customerDemographicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fourth Row - Search Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search Trends Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={searchTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--foreground))" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  formatter={(value, name) => [value.toLocaleString(), name]} 
                />
                <Legend />
                <Line type="monotone" dataKey="searches" stroke="#8884d8" strokeWidth={2} name="Searches" />
                <Line type="monotone" dataKey="clicks" stroke="#82ca9d" strokeWidth={2} name="Clicks" />
                <Line type="monotone" dataKey="conversions" stroke="#ffc658" strokeWidth={2} name="Conversions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {performanceData.map((item, index) => (
              <div key={item.metric} className="text-center">
                <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="60%" 
                      outerRadius="90%" 
                      data={[{ ...item, percentage: (item.value / item.target) * 100 }]}
                    >
                      <RadialBar 
                        dataKey="percentage" 
                        cornerRadius={10} 
                        fill={item.fill}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <h3 className="font-medium text-sm text-gray-600 mt-2">{item.metric}</h3>
                <div className="flex items-center justify-center mt-1">
                  <span className="text-lg font-bold text-gray-900">{item.value}{item.unit}</span>
                  <span className="text-sm text-gray-500 ml-1">/ {item.target}{item.unit}</span>
                </div>
                <div className="mt-1">
                  <span className={`text-xs ${
                    item.inverse 
                      ? (item.value <= item.target ? 'text-green-600' : 'text-red-600')
                      : (item.value >= item.target * 0.8 ? 'text-green-600' : 'text-yellow-600')
                  }`}>
                    {item.inverse 
                      ? (item.value <= item.target ? '✓ Within target' : '⚠ Above target') 
                      : (item.value >= item.target * 0.8 ? '✓ On track' : '⚠ Needs attention')
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
