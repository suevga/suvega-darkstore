import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LucideIcon } from 'lucide-react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

interface ResponsiveChartContainerProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  height?: string;
  description?: string;
}

export const ResponsiveChartContainer = ({ 
  title, 
  icon: Icon, 
  children, 
  className,
  height = "h-[250px] sm:h-[300px] lg:h-[350px]",
  description
}: ResponsiveChartContainerProps) => {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-sm sm:text-base">
              {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
              {title}
            </CardTitle>
            {description && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className={cn("w-full", height)}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
