import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface MobileStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  className?: string;
}

export const MobileStatsCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  className 
}: MobileStatsCardProps) => {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-lg sm:text-2xl font-bold text-gray-900">
          {value}
        </div>
        {change && (
          <div className="flex items-center mt-1">
            <span className={cn(
              "text-xs",
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
              {change}
            </span>
            <span className="text-xs text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
